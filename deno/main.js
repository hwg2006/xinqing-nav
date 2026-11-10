const HTML = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#eef4f7\">\n<title>心晴导航 · 随时可用的情绪陪伴</title>\n<style>\n  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\n  html, body { height: 100%; margin: 0; }\n  body {\n    font-family: \"PingFang SC\", \"Microsoft YaHei\", \"Hiragino Sans GB\", system-ui, sans-serif;\n    background: radial-gradient(1200px 600px at 20% 0%, #dff0ee 0%, #eef4f7 45%, #f7f5f1 100%);\n    color: #1f2d33;\n    display: flex;\n    justify-content: center;\n  }\n  .shell {\n    width: 100%;\n    max-width: 780px;\n    height: 100dvh;\n    display: flex;\n    flex-direction: column;\n    padding: 18px 16px 0;\n  }\n  header { display: flex; align-items: center; gap: 12px; padding: 4px 2px 14px; }\n  .logo {\n    width: 42px; height: 42px; border-radius: 14px; flex: none;\n    background: linear-gradient(150deg, #5fb3a8, #3d8f96);\n    box-shadow: 0 8px 18px rgba(61, 143, 150, .28);\n    display: grid; place-items: center;\n  }\n  .logo svg { width: 22px; height: 22px; }\n  .brand h1 { font-size: 17px; margin: 0; letter-spacing: .5px; font-weight: 600; }\n  .brand p { margin: 2px 0 0; font-size: 12px; color: #6b8089; }\n  .notice {\n    font-size: 12px; line-height: 1.6; color: #5d737c;\n    background: rgba(255,255,255,.62);\n    border: 1px solid rgba(95, 179, 168, .22);\n    border-radius: 12px;\n    padding: 9px 12px;\n    margin-bottom: 10px;\n  }\n  .notice b { color: #2f6f73; font-weight: 600; }\n  #log {\n    flex: 1; overflow-y: auto; padding: 4px 2px 12px;\n    display: flex; flex-direction: column; gap: 12px;\n    scroll-behavior: smooth;\n  }\n  #log::-webkit-scrollbar { width: 6px; }\n  #log::-webkit-scrollbar-thumb { background: rgba(95,179,168,.35); border-radius: 3px; }\n  .msg { display: flex; gap: 8px; max-width: 92%; animation: rise .25s ease; }\n  @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }\n  .msg.user { margin-left: auto; flex-direction: row-reverse; }\n  .avatar {\n    width: 30px; height: 30px; border-radius: 10px; flex: none;\n    display: grid; place-items: center; font-size: 12px; font-weight: 600;\n    background: #fff; color: #3d8f96; border: 1px solid rgba(95,179,168,.3);\n  }\n  .msg.user .avatar { background: #3d8f96; color: #fff; border-color: transparent; }\n  .bubble {\n    padding: 11px 14px; border-radius: 16px; font-size: 14.5px; line-height: 1.72;\n    white-space: pre-wrap; word-break: break-word;\n    background: #fff; border: 1px solid rgba(31,45,51,.06);\n    box-shadow: 0 4px 14px rgba(31,45,51,.05);\n  }\n  .msg.user .bubble {\n    background: linear-gradient(150deg, #57a9a2, #3d8f96); color: #fff;\n    border-color: transparent; box-shadow: 0 6px 16px rgba(61,143,150,.22);\n  }\n  .bubble.error { background: #fdf1ee; border-color: #f3d3ca; color: #a04b34; }\n  .typing::after {\n    content: \"\"; display: inline-block; width: 6px; height: 15px; margin-left: 2px;\n    background: #5fb3a8; vertical-align: -2px; animation: blink 1s steps(1) infinite;\n  }\n  @keyframes blink { 50% { opacity: 0; } }\n  .chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 10px; scrollbar-width: none; }\n  .chips::-webkit-scrollbar { display: none; }\n  .chip {\n    flex: none; font-size: 12.5px; color: #35636a; cursor: pointer;\n    background: rgba(255,255,255,.8); border: 1px solid rgba(95,179,168,.32);\n    padding: 7px 12px; border-radius: 999px; transition: .18s;\n  }\n  .chip:hover { background: #fff; border-color: #5fb3a8; transform: translateY(-1px); }\n  .composer {\n    display: flex; gap: 10px; align-items: flex-end;\n    padding: 10px 0 calc(14px + env(safe-area-inset-bottom));\n    background: transparent;\n  }\n  textarea {\n    flex: 1; resize: none; max-height: 120px; min-height: 46px;\n    padding: 13px 15px; border-radius: 15px; font: inherit; font-size: 14.5px;\n    border: 1px solid rgba(31,45,51,.12); background: #fff; color: inherit;\n    outline: none; transition: border-color .18s, box-shadow .18s;\n  }\n  textarea:focus { border-color: #5fb3a8; box-shadow: 0 0 0 3px rgba(95,179,168,.15); }\n  button.send {\n    flex: none; height: 46px; padding: 0 20px; border: 0; border-radius: 15px;\n    font: inherit; font-size: 14px; font-weight: 600; color: #fff; cursor: pointer;\n    background: linear-gradient(150deg, #57a9a2, #3d8f96);\n    box-shadow: 0 6px 16px rgba(61,143,150,.28);\n    transition: .18s;\n  }\n  button.send:hover { transform: translateY(-1px); }\n  button.send:disabled { opacity: .5; cursor: not-allowed; transform: none; }\n  .mask {\n    position: fixed; inset: 0; background: rgba(20,32,36,.42); backdrop-filter: blur(3px);\n    display: none; place-items: center; z-index: 9; padding: 24px;\n  }\n  .mask.show { display: grid; }\n  .card {\n    width: 100%; max-width: 340px; background: #fff; border-radius: 20px; padding: 22px 20px;\n    box-shadow: 0 20px 50px rgba(20,32,36,.25);\n  }\n  .card h2 { margin: 0 0 6px; font-size: 16px; }\n  .card p { margin: 0 0 14px; font-size: 12.5px; color: #6b8089; line-height: 1.6; }\n  .card input {\n    width: 100%; padding: 11px 13px; border-radius: 11px; font: inherit; font-size: 14px;\n    border: 1px solid rgba(31,45,51,.15); outline: none; margin-bottom: 10px;\n  }\n  .card input:focus { border-color: #5fb3a8; }\n  .card button {\n    width: 100%; height: 42px; border: 0; border-radius: 11px; font: inherit; font-weight: 600;\n    color: #fff; cursor: pointer; background: linear-gradient(150deg, #57a9a2, #3d8f96);\n  }\n  .err-tip { color: #a04b34; font-size: 12px; min-height: 16px; margin-bottom: 6px; }\n  @media (max-width: 480px) {\n    .shell { padding: 12px 12px 0; }\n    .brand h1 { font-size: 16px; }\n    .bubble { font-size: 14px; }\n  }\n</style>\n</head>\n<body>\n<div class=\"shell\">\n  <header>\n    <div class=\"logo\">\n      <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <path d=\"M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.1C19 15.6 12 20 12 20z\"/>\n      </svg>\n    </div>\n    <div class=\"brand\">\n      <h1>心晴导航</h1>\n      <p>不预约、不排队的校园心理支持</p>\n    </div>\n  </header>\n\n  <div class=\"notice\">\n    这是 AI 陪伴体验，不是心理咨询或医疗诊断。如果你有伤害自己的想法，请立即拨打 <b>12356</b> 或 <b>120</b>，或联系身边信任的人。\n  </div>\n\n  <div id=\"log\"></div>\n\n  <div class=\"chips\" id=\"chips\">\n    <div class=\"chip\">最近总是睡不着，脑子停不下来</div>\n    <div class=\"chip\">明天要答辩，现在心跳得厉害</div>\n    <div class=\"chip\">室友关系让我很累，不知道怎么开口</div>\n    <div class=\"chip\">做什么都提不起劲，是不是我太脆弱了</div>\n    <div class=\"chip\">笑死我了，食堂阿姨今天多打了一勺菜</div>\n    <div class=\"chip\">压力大到一个都不想开了</div>\n    <div class=\"chip\">我想跳了，真的撑不住</div>\n  </div>\n\n  <div class=\"composer\">\n    <textarea id=\"input\" rows=\"1\" placeholder=\"想说什么都可以，我在听…\" maxlength=\"500\"></textarea>\n    <button class=\"send\" id=\"send\">发送</button>\n  </div>\n</div>\n\n<div class=\"mask\" id=\"mask\">\n  <div class=\"card\">\n    <h2>输入体验口令</h2>\n    <p>为防止链接被公开滥用，请输入主办方提供或作品说明中的访问口令。</p>\n    <input id=\"code\" type=\"text\" placeholder=\"访问口令\" autocomplete=\"off\">\n    <div class=\"err-tip\" id=\"errTip\"></div>\n    <button id=\"okCode\">进入体验</button>\n  </div>\n</div>\n\n<script>\n(function () {\n  const log = document.getElementById('log');\n  const input = document.getElementById('input');\n  const sendBtn = document.getElementById('send');\n  const mask = document.getElementById('mask');\n  const codeInput = document.getElementById('code');\n  const errTip = document.getElementById('errTip');\n  const CODE_KEY = 'xq_access_code';\n\n  let history = [];\n  let busy = false;\n  let needCode = false;\n  let pendingText = '';\n\n  function el(tag, cls, text) {\n    const n = document.createElement(tag);\n    if (cls) n.className = cls;\n    if (text !== undefined) n.textContent = text;\n    return n;\n  }\n\n  function scrollBottom() { log.scrollTop = log.scrollHeight; }\n\n  function addMsg(role, text) {\n    const wrap = el('div', 'msg ' + role);\n    wrap.appendChild(el('div', 'avatar', role === 'user' ? '我' : '晴'));\n    const bubble = el('div', 'bubble', text || '');\n    wrap.appendChild(bubble);\n    log.appendChild(wrap);\n    scrollBottom();\n    return bubble;\n  }\n\n  function showMask(msg) {\n    needCode = true;\n    errTip.textContent = msg || '';\n    mask.classList.add('show');\n    codeInput.focus();\n  }\n\n  function autoGrow() {\n    input.style.height = 'auto';\n    input.style.height = Math.min(input.scrollHeight, 120) + 'px';\n  }\n\n  async function send(text) {\n    text = (text || input.value).trim();\n    if (!text || busy) return;\n    busy = true;\n    sendBtn.disabled = true;\n    input.value = '';\n    autoGrow();\n\n    addMsg('user', text);\n    history.push({ role: 'user', content: text });\n    if (history.length > 16) history = history.slice(-16);\n\n    const bubble = addMsg('assistant', '');\n    bubble.classList.add('typing');\n\n    let acc = '';\n    try {\n      const res = await fetch('/api/chat', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n          'X-Access-Code': localStorage.getItem(CODE_KEY) || ''\n        },\n        body: JSON.stringify({ messages: history })\n      });\n\n      if (res.status === 401) {\n        history.pop();\n        bubble.remove();\n        pendingText = text;\n        const data = await res.json().catch(() => ({}));\n        showMask(data.error || '请先输入访问口令');\n        return;\n      }\n      if (!res.ok) {\n        const data = await res.json().catch(() => ({}));\n        bubble.classList.remove('typing');\n        bubble.classList.add('error');\n        bubble.textContent = data.error || ('请求失败（' + res.status + '）');\n        history.pop();\n        return;\n      }\n\n      const reader = res.body.getReader();\n      const decoder = new TextDecoder('utf-8');\n      let buffer = '';\n      let failed = false;\n\n      while (true) {\n        const { done, value } = await reader.read();\n        if (done) break;\n        buffer += decoder.decode(value, { stream: true });\n        const lines = buffer.split('\\n');\n        buffer = lines.pop();\n        for (const line of lines) {\n          if (!line.startsWith('data:')) continue;\n          const raw = line.slice(5).trim();\n          if (!raw) continue;\n          let obj;\n          try { obj = JSON.parse(raw); } catch (e) { continue; }\n          if (obj.type === 'delta') {\n            acc += obj.text;\n            bubble.textContent = acc;\n            scrollBottom();\n          } else if (obj.type === 'error') {\n            failed = true;\n            bubble.classList.remove('typing');\n            bubble.classList.add('error');\n            bubble.textContent = obj.message || '出了点问题，请再试一次';\n          } else if (obj.type === 'done') {\n            bubble.classList.remove('typing');\n          }\n        }\n      }\n      bubble.classList.remove('typing');\n      if (!failed && acc) {\n        history.push({ role: 'assistant', content: acc });\n      } else if (!failed && !acc) {\n        bubble.classList.add('error');\n        bubble.textContent = '没有收到回复，请再发一次';\n      }\n    } catch (e) {\n      bubble.classList.remove('typing');\n      bubble.classList.add('error');\n      bubble.textContent = '网络开小差了，请检查连接后重试';\n    } finally {\n      busy = false;\n      sendBtn.disabled = false;\n      scrollBottom();\n      input.focus();\n    }\n  }\n\n  sendBtn.addEventListener('click', () => send());\n  input.addEventListener('keydown', (e) => {\n    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }\n  });\n  input.addEventListener('input', autoGrow);\n\n  document.getElementById('chips').addEventListener('click', (e) => {\n    const chip = e.target.closest('.chip');\n    if (chip) send(chip.textContent);\n  });\n\n  document.getElementById('okCode').addEventListener('click', async () => {\n    const code = codeInput.value.trim();\n    if (!code) { errTip.textContent = '请输入口令'; return; }\n    localStorage.setItem(CODE_KEY, code);\n    mask.classList.remove('show');\n    errTip.textContent = '';\n    if (pendingText) {\n      const text = pendingText;\n      pendingText = '';\n      await send(text);\n    }\n  });\n\n  codeInput.addEventListener('keydown', (e) => {\n    if (e.key === 'Enter') document.getElementById('okCode').click();\n  });\n\n  fetch('/api/config').then(r => r.json()).then(cfg => {\n    if (cfg.need_code && !localStorage.getItem(CODE_KEY)) showMask('');\n  }).catch(() => {});\n\n  addMsg('assistant', '你好，我是晴晴。今天想聊点什么？\\n不着急，慢慢说，我在听。');\n})();\n</script>\n</body>\n</html>\n";

// 心晴导航 · 公网体验版（Deno Deploy 运行时核心）
// 与 Cloudflare 版逻辑一致：服务端托管 Key、SSE 流式、IP 限流、危机语义识别。
// 生成的 main.js = const HTML = ...; + 本文件内容。

const DEFAULT_SYSTEM_PROMPT = `你是「心晴导航」的数字人陪伴者「晴晴」，服务在校学生，一位温和、专业、有边界感的心理陪伴者。
请遵守：
1. 用口语化的中文，先共情再回应，一次只问一个最关键的问题。
2. 回答控制在一百二十字以内，不要长篇大论、不要罗列一二三四。
3. 可以给一个具体可做的小动作（4-7-8 呼吸、散步五分钟、给朋友发条消息）。
4. 不做医学诊断、不承诺疗效、不替代专业咨询。
5. 危机识别要看语境，不要只匹配字面：听到「笑死我了」「累死了」这类夸张口语时正常共情，不要误判为危机；
   只有当表达出真实的自伤/轻生意图或计划时，才明确提醒立即联系 110 / 120 / 12356，并陪伴确认当下安全。
6. 只回答与情绪、关系、学习压力、睡眠、校园生活相关的话题；无关话题温和拉回。
7. 直接输出纯文本，不要使用 Markdown 的 **、#、> 等符号。`;

const MAX_MSG_CHARS = 500;
const MAX_HISTORY = 8;
const MAX_TOKENS = 400;
const PER_IP_MIN = 8;
const PER_IP_DAY = 120;
const GLOBAL_DAY = 3000;

// 危机语义识别：先看有没有真实自伤表达，再排除「笑死我了」「累得要死」这类夸张口语
const CRISIS_PAT = /(想死|想自杀|自杀|轻生|不想活|活不下去|想跳楼|想跳了|跳下去|割腕|结束生命|伤害自己|我要死了|去死)/;
const SOFT_PAT = /(笑|累|困|吓|气|饿|热|冷|忙|烦|美|帅|香|甜)(得|到)?(要)?死|死机|死党|死磕/;
const CRISIS_REPLY = '我很在意你现在的安全。先别一个人扛着——请立刻拨打 12356（心理援助热线）或 120，也可以马上找一个你信任的人陪在身边。\n';

function isCrisis(text) {
  return CRISIS_PAT.test(text) && !SOFT_PAT.test(text);
}

function env(key, fallback = '') {
  try {
    return Deno.env.get(key) || fallback;
  } catch {
    return fallback;
  }
}

function cors(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Code',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    ...extra,
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: cors({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }),
  });
}

const sse = (obj) => 'data: ' + JSON.stringify(obj) + '\n\n';

function sanitize(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== 'object') continue;
    const role = item.role;
    let content = item.content;
    if (role !== 'user' && role !== 'assistant') continue;
    if (typeof content !== 'string') continue;
    content = content.trim().slice(0, MAX_MSG_CHARS);
    if (content) out.push({ role, content });
  }
  if (!out.length || out[out.length - 1].role !== 'user') return [];
  return out;
}

const minute = new Map();
const day = new Map();
let total = 0;
let dayKey = '';

function quota(ip) {
  const now = Date.now();
  const today = new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
  if (dayKey !== today) {
    dayKey = today;
    day.clear();
    minute.clear();
    total = 0;
  }
  const q = (minute.get(ip) || []).filter((t) => now - t < 60000);
  if (q.length >= PER_IP_MIN) {
    minute.set(ip, q);
    return { ok: false, reason: '说得有点快啦，休息一分钟再聊。' };
  }
  const used = day.get(ip) || 0;
  if (used >= PER_IP_DAY) return { ok: false, reason: '今天的对话次数已用完，明天再来找我。' };
  if (total >= GLOBAL_DAY) return { ok: false, reason: '今天的体验名额已满，请明天再来。' };
  q.push(now);
  minute.set(ip, q);
  day.set(ip, used + 1);
  total += 1;
  return { ok: true };
}

async function sha12(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 6).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function upstream() {
  const key = env('LLM_API_KEY');
  if (key) {
    const base = (env('LLM_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4')).replace(/\/$/, '');
    return {
      url: base + '/chat/completions',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      model: env('LLM_MODEL', 'glm-4-flash'),
    };
  }
  // 免 Key 兜底通道：没有配置 Key 时保证链接仍然可体验
  return {
    url: 'https://text.pollinations.ai/openai',
    headers: { 'Content-Type': 'application/json' },
    model: 'openai',
  };
}

async function handleChat(request, ip) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
  if (request.method !== 'POST') return json({ error: '只支持 POST' }, 405);

  const code = env('ACCESS_CODE');
  if (code && request.headers.get('X-Access-Code') !== code) {
    return json({ error: '访问口令不正确', need_code: true }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '请求格式错误' }, 400);
  }

  const messages = sanitize(body.messages);
  if (!messages.length) return json({ error: '消息不能为空' }, 400);

  const ipHash = await sha12(ip);
  const allowed = quota(ipHash);
  if (!allowed.ok) return json({ error: allowed.reason }, 429);

  const up = upstream();
  const crisis = isCrisis(messages[messages.length - 1].content);
  const system = env('SYSTEM_PROMPT', DEFAULT_SYSTEM_PROMPT) +
    (crisis ? '\n【安全优先】用户刚刚表达了明确的自伤意图。请先确认 TA 此刻是否安全、身边有没有人，语气要稳、要慢，不要追问细节，也不要给大道理。' : '');
  const payload = {
    model: up.model,
    messages: [{ role: 'system', content: system }, ...messages],
    stream: true,
    temperature: 0.7,
    // 免 Key 通道的模型会先输出思考过程，预算太小会导致正文为空
    max_tokens: env('LLM_API_KEY') ? MAX_TOKENS : 900,
  };
  if (!env('LLM_API_KEY')) payload.reasoning_effort = 'low';

  const startedAt = Date.now();
  let resp;
  try {
    resp = await fetch(up.url, { method: 'POST', headers: up.headers, body: JSON.stringify(payload) });
  } catch {
    return json({ error: '模型服务连接失败，请稍后再试' }, 502);
  }
  if (!resp.ok || !resp.body) {
    await resp.text().catch(() => '');
    return json({ error: `模型服务返回 ${resp.status}，请稍后再试` }, 502);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = '';
      let chars = 0;
      // 危机转介先落地：即使模型发挥不稳定，求助渠道也一定出现在回答里
      if (crisis) {
        controller.enqueue(encoder.encode(sse({ type: 'delta', text: CRISIS_REPLY })));
        chars += CRISIS_REPLY.length;
      }
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const chunk = trimmed.slice(5).trim();
            if (chunk === '[DONE]') {
              controller.enqueue(encoder.encode(sse({ type: 'done' })));
              console.log(`[chat] ip=${ipHash} turns=${messages.length} chars=${chars} ms=${Date.now() - startedAt}`);
              controller.close();
              return;
            }
            try {
              const piece = JSON.parse(chunk)?.choices?.[0]?.delta?.content || '';
              if (piece) {
                chars += piece.length;
                controller.enqueue(encoder.encode(sse({ type: 'delta', text: piece })));
              }
            } catch {
              // 心跳/空包直接跳过
            }
          }
        }
        controller.enqueue(encoder.encode(sse({ type: 'done' })));
        console.log(`[chat] ip=${ipHash} turns=${messages.length} chars=${chars} ms=${Date.now() - startedAt}`);
        controller.close();
      } catch {
        controller.enqueue(encoder.encode(sse({ type: 'error', message: '网络连接中断，请再发一次' })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: cors({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    }),
  });
}

function clientIp(request, info) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const remote = info?.remoteAddr?.hostname;
  return remote || 'unknown';
}

Deno.serve(async (request, info) => {
  const url = new URL(request.url);
  if (url.pathname === '/api/chat') return handleChat(request, clientIp(request, info));
  if (url.pathname === '/api/config') {
    return json({ need_code: Boolean(env('ACCESS_CODE')), model: env('LLM_API_KEY') ? env('LLM_MODEL', 'glm-4-flash') : 'keyless-demo' });
  }
  if (url.pathname === '/api/health') {
    return json({
      status: 'ok',
      model: env('LLM_API_KEY') ? env('LLM_MODEL', 'glm-4-flash') : 'keyless-demo',
      key_configured: Boolean(env('LLM_API_KEY')),
    });
  }
  if (url.pathname.startsWith('/api/')) return json({ error: 'not found' }, 404);
  return new Response(HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
});
