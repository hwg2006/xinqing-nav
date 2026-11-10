#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""心晴导航 · 公网体验版（单文件 FastAPI）

设计目标：
  1. 评委打开链接即用，无需登录平台、无需填任何 Key。
  2. 大模型 Key 只存在于服务端环境变量，任何接口都不返回、不下发前端。
  3. 多层防滥用：访问口令 + 单 IP 分钟/日限流 + 全站日配额 + 并发上限
     + 单条消息长度上限 + 历史条数上限 + 单次 max_tokens 上限。
  4. 隐私友好：日志只记录 IP 哈希与字数，不落库对话内容。

启动：
    uvicorn app:app --host 0.0.0.0 --port 7860
"""

import asyncio
import hashlib
import json
import os
import time
from collections import defaultdict, deque
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

# ---------- 上游大模型（OpenAI 兼容接口） ----------
# 配置了 LLM_API_KEY 就用你自己的模型（默认智谱 GLM-4-Flash，注册即可免费调用）。
# 没有配置时自动走免 Key 兜底通道，保证评委打开链接永远能体验，不会出现 503。
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4").rstrip("/")
LLM_API_KEY = os.getenv("LLM_API_KEY", "").strip()
LLM_MODEL = os.getenv("LLM_MODEL", "glm-4-flash")

KEYLESS_URL = "https://text.pollinations.ai/openai"
UPSTREAM_URL = f"{LLM_BASE_URL}/chat/completions" if LLM_API_KEY else KEYLESS_URL
UPSTREAM_MODEL = LLM_MODEL if LLM_API_KEY else "openai"
UPSTREAM_HEADERS = (
    {"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"}
    if LLM_API_KEY
    else {"Content-Type": "application/json"}
)

# ---------- 防护参数（都可用环境变量覆盖） ----------
ACCESS_CODE = os.getenv("ACCESS_CODE", "").strip()   # 留空 = 不要求口令
MAX_MSG_CHARS = int(os.getenv("MAX_MSG_CHARS", "500"))
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "8"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "400"))
PER_IP_MIN = int(os.getenv("PER_IP_MIN", "8"))
PER_IP_DAY = int(os.getenv("PER_IP_DAY", "120"))
GLOBAL_DAY = int(os.getenv("GLOBAL_DAY", "3000"))
MAX_CONCURRENCY = int(os.getenv("MAX_CONCURRENCY", "4"))

SYSTEM_PROMPT = """你是「心晴导航」的数字人辅导员「晴晴」，服务在校学生群体，一位温和、专业、有边界感的心理陪伴者。
请遵守：
1. 用口语化的中文，先共情再回应，一次只问一个最关键的问题。
2. 回答控制在一百二十字以内，不要长篇大论、不要罗列一二三四。
3. 可以给一个具体可做的小动作（如 4-7-8 呼吸、散步五分钟、给朋友发一条消息）。
4. 不做医学诊断、不承诺疗效、不替代专业咨询。
5. 危机识别要看语境，不要只匹配字面：听到「笑死我了」「累死了」这类夸张口语时正常共情，不要误判为危机；
   只有当表达出真实的自伤/轻生意图或计划时，才明确提醒立即联系 110 / 120 / 12356，并陪伴确认当下安全。
6. 只回答与情绪、关系、学习压力、睡眠、校园生活相关的话题；无关话题温和地拉回。
7. 直接输出纯文本，不要使用 Markdown 加粗（**）、标题（#）、引用（>）等符号。"""


class Limiter:
    """进程内滑动窗口限流。单实例部署足够；多实例时每个实例各算一份。"""

    def __init__(self) -> None:
        self.minute: dict[str, deque] = defaultdict(deque)
        self.day: dict[str, list] = {}
        self.total = [0, ""]
        self.lock = asyncio.Lock()

    async def check(self, ip: str) -> tuple[bool, str]:
        now = time.time()
        today = time.strftime("%Y%m%d")
        async with self.lock:
            q = self.minute[ip]
            while q and now - q[0] > 60:
                q.popleft()
            if len(q) >= PER_IP_MIN:
                return False, "说得有点快啦，休息一分钟再聊吧。"

            rec = self.day.get(ip)
            if not rec or rec[1] != today:
                rec = [0, today]
                self.day[ip] = rec
            if rec[0] >= PER_IP_DAY:
                return False, "今天的对话次数已用完，明天再来找我。"

            if self.total[1] != today:
                self.total = [0, today]
            if self.total[0] >= GLOBAL_DAY:
                return False, "今天的体验名额已满，请明天再来。"

            q.append(now)
            rec[0] += 1
            self.total[0] += 1

            if len(self.day) > 5000:  # 轻量清理，避免内存无限增长
                stale = [k for k, v in self.day.items() if v[1] != today]
                for k in stale:
                    self.day.pop(k, None)
                    self.minute.pop(k, None)
            return True, ""


limiter = Limiter()
semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
client = httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0))

app = FastAPI(title="心晴导航 · 公网体验版", docs_url=None, redoc_url=None)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")
    return ip or "unknown"


def _sse(payload: dict) -> str:
    return "data: " + json.dumps(payload, ensure_ascii=False) + "\n\n"


def _sanitize(raw) -> list[dict]:
    """只保留 user/assistant 文本，截断长度与条数，丢弃前端塞进来的 system 角色。"""
    if not isinstance(raw, list):
        return []
    out: list[dict] = []
    for item in raw[-MAX_HISTORY:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        if role not in ("user", "assistant") or not isinstance(content, str):
            continue
        content = content.strip()[:MAX_MSG_CHARS]
        if content:
            out.append({"role": role, "content": content})
    if not out or out[-1]["role"] != "user":
        return []
    return out


@app.get("/api/config")
async def config():
    """只告诉前端是否需要口令，不泄露任何 Key 信息。"""
    return {"need_code": bool(ACCESS_CODE), "model": UPSTREAM_MODEL}


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": UPSTREAM_MODEL, "key_configured": bool(LLM_API_KEY)}


@app.post("/api/chat")
async def chat(request: Request):
    if ACCESS_CODE and request.headers.get("x-access-code", "") != ACCESS_CODE:
        return JSONResponse({"error": "访问口令不正确", "need_code": True}, status_code=401)

    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "请求格式错误"}, status_code=400)

    # 先校验内容，再扣配额：无效请求不应消耗使用次数
    messages = _sanitize(body.get("messages"))
    if not messages:
        return JSONResponse({"error": "消息不能为空"}, status_code=400)

    ip = _client_ip(request)
    allowed, reason = await limiter.check(ip)
    if not allowed:
        return JSONResponse({"error": reason}, status_code=429)

    payload = {
        "model": UPSTREAM_MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "stream": True,
        "temperature": 0.7,
        "max_tokens": MAX_TOKENS,
    }

    async def gen():
        if semaphore.locked():
            yield _sse({"type": "error", "message": "现在人有点多，稍等几秒再发一次～"})
            return
        async with semaphore:
            try:
                async with client.stream(
                    "POST", UPSTREAM_URL, json=payload, headers=UPSTREAM_HEADERS
                ) as r:
                    if r.status_code != 200:
                        await r.aread()
                        yield _sse({"type": "error", "message": f"模型服务返回 {r.status_code}，请稍后再试"})
                        return
                    async for line in r.aiter_lines():
                        if not line or not line.startswith("data:"):
                            continue
                        chunk = line[5:].strip()
                        if chunk == "[DONE]":
                            break
                        try:
                            obj = json.loads(chunk)
                        except ValueError:
                            continue
                        delta = (obj.get("choices") or [{}])[0].get("delta") or {}
                        piece = delta.get("content") or ""
                        if piece:
                            yield _sse({"type": "delta", "text": piece})
                yield _sse({"type": "done"})
            except httpx.HTTPError:
                yield _sse({"type": "error", "message": "网络连接超时，请再发一次"})
            finally:
                # 只记录脱敏信息：IP 哈希 + 轮次 + 字符数
                ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:12]
                chars = sum(len(m["content"]) for m in messages)
                print(f"[chat] ip={ip_hash} turns={len(messages)} chars={chars}", flush=True)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# 静态前端挂载在最后，避免覆盖 /api 路由
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
