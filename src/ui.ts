export const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cline Agent Server</title>
  <style>
    :root {
      --bg: #0b0f14;
      --panel: #121821;
      --panel-2: #171f2b;
      --line: rgba(120, 160, 200, 0.18);
      --text: #e8f0f7;
      --muted: #8ea0b5;
      --accent: #4ea6ff;
      --green: #67e68a;
      --amber: #f4b23a;
      --red: #ff6b81;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; }
    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 15% -10%, rgba(78, 166, 255, 0.18), transparent 35%),
        radial-gradient(circle at 85% 0%, rgba(103, 230, 138, 0.08), transparent 30%),
        linear-gradient(160deg, #070a0f, #0b1118 55%, #06080c);
    }

    .layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      height: 100vh;
      gap: 0;
    }

    .sidebar {
      border-right: 1px solid var(--line);
      background: rgba(8, 12, 18, 0.92);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.15rem;
      letter-spacing: 0.02em;
    }

    .brand p {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .meta {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      padding: 12px;
      font-size: 0.82rem;
      color: var(--muted);
      line-height: 1.5;
    }

    .meta strong { color: var(--text); }

    .main {
      display: grid;
      grid-template-rows: auto 1fr auto;
      min-height: 0;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--line);
      background: rgba(10, 14, 20, 0.75);
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--muted);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--muted);
    }

    .dot.live { background: var(--green); box-shadow: 0 0 10px rgba(103, 230, 138, 0.55); }
    .dot.busy { background: var(--amber); box-shadow: 0 0 10px rgba(244, 178, 58, 0.45); }

    .log {
      overflow: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bubble {
      max-width: 920px;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px 14px;
      background: var(--panel);
      white-space: pre-wrap;
      line-height: 1.55;
      font-size: 0.95rem;
    }

    .bubble.user {
      align-self: flex-end;
      background: rgba(78, 166, 255, 0.12);
      border-color: rgba(78, 166, 255, 0.35);
    }

    .bubble.system {
      color: var(--muted);
      font-size: 0.85rem;
      background: transparent;
      border-style: dashed;
    }

    .composer {
      border-top: 1px solid var(--line);
      padding: 16px 20px 20px;
      background: rgba(10, 14, 20, 0.85);
    }

    .composer form {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 10px;
    }

    textarea {
      width: 100%;
      min-height: 84px;
      resize: vertical;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      padding: 12px 14px;
      font: inherit;
    }

    button {
      border: 0;
      border-radius: 12px;
      padding: 0 16px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      color: #041018;
      background: var(--accent);
    }

    button.secondary {
      color: var(--text);
      background: transparent;
      border: 1px solid var(--line);
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <h1>Cline Agent Server</h1>
        <p>Autonomous coding agent powered by the Cline SDK. Ask it to edit files, run commands, and complete coding tasks in the configured workspace.</p>
      </div>
      <div class="meta" id="config-box">Loading configuration...</div>
      <div class="meta">
        <strong>API endpoints</strong><br>
        POST /api/sessions<br>
        POST /api/sessions/:id/messages<br>
        GET /api/sessions/:id/stream
      </div>
    </aside>

    <section class="main">
      <div class="toolbar">
        <div class="status">
          <span class="dot" id="status-dot"></span>
          <span id="status-text">Idle</span>
        </div>
        <div>
          <button class="secondary" id="abort-btn" type="button" disabled>Abort</button>
          <button class="secondary" id="new-session-btn" type="button">New session</button>
        </div>
      </div>

      <div class="log" id="log"></div>

      <div class="composer">
        <form id="prompt-form">
          <textarea id="prompt" placeholder="Ask the agent to build, refactor, debug, or review code..."></textarea>
          <button type="submit" id="send-btn">Send</button>
          <button class="secondary" type="button" id="clear-btn">Clear</button>
        </form>
      </div>
    </section>
  </div>

  <script>
    const logEl = document.getElementById("log");
    const promptEl = document.getElementById("prompt");
    const formEl = document.getElementById("prompt-form");
    const sendBtn = document.getElementById("send-btn");
    const abortBtn = document.getElementById("abort-btn");
    const clearBtn = document.getElementById("clear-btn");
    const newSessionBtn = document.getElementById("new-session-btn");
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    const configBox = document.getElementById("config-box");

    let sessionId = null;
    let stream = null;
    let assistantBuffer = "";

    function appendBubble(text, kind = "assistant") {
      const el = document.createElement("div");
      el.className = "bubble " + kind;
      el.textContent = text;
      logEl.appendChild(el);
      logEl.scrollTop = logEl.scrollHeight;
      return el;
    }

    function setBusy(busy) {
      sendBtn.disabled = busy;
      abortBtn.disabled = !busy || !sessionId;
      statusDot.className = "dot " + (busy ? "busy" : sessionId ? "live" : "");
      statusText.textContent = busy ? "Agent working..." : sessionId ? "Session active" : "Idle";
    }

    function closeStream() {
      if (stream) {
        stream.close();
        stream = null;
      }
    }

    function connectStream(id) {
      closeStream();
      stream = new EventSource("/api/sessions/" + encodeURIComponent(id) + "/stream");

      stream.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === "chunk" && payload.stream === "agent") {
          assistantBuffer += payload.text || "";
          let live = document.getElementById("live-assistant");
          if (!live) {
            live = appendBubble("", "assistant");
            live.id = "live-assistant";
          }
          live.textContent = assistantBuffer;
          logEl.scrollTop = logEl.scrollHeight;
        }

        if (payload.type === "ended") {
          assistantBuffer = "";
          document.getElementById("live-assistant")?.removeAttribute("id");
          setBusy(false);
        }

        if (payload.type === "status") {
          appendBubble("Status: " + payload.status, "system");
        }
      };

      stream.onerror = () => {
        appendBubble("Stream disconnected. Reconnect by sending another message.", "system");
        closeStream();
        setBusy(false);
      };
    }

    async function loadConfig() {
      const res = await fetch("/api/config");
      const data = await res.json();
      configBox.innerHTML =
        "<strong>Model</strong><br>" + data.providerId + " / " + data.modelId +
        "<br><br><strong>Workspace</strong><br>" + data.workspaceRoot +
        "<br><br><strong>API key</strong><br>" + (data.hasApiKey ? "Configured" : "Missing") +
        "<br><br><strong>YOLO mode</strong><br>" + (data.yoloMode ? "Enabled" : "Disabled");
    }

    async function sendPrompt(prompt) {
      if (!prompt.trim()) return;

      appendBubble(prompt, "user");
      setBusy(true);
      assistantBuffer = "";
      document.getElementById("live-assistant")?.removeAttribute("id");

      const endpoint = sessionId
        ? "/api/sessions/" + encodeURIComponent(sessionId) + "/messages"
        : "/api/sessions";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        appendBubble(data.error || "Request failed", "system");
        setBusy(false);
        return;
      }

      if (!sessionId) {
        sessionId = data.sessionId;
        connectStream(sessionId);
        appendBubble("Session " + sessionId, "system");
      }

      if (data.result?.text) {
        appendBubble(data.result.text, "assistant");
        setBusy(false);
      }
    }

    formEl.addEventListener("submit", async (event) => {
      event.preventDefault();
      const prompt = promptEl.value;
      promptEl.value = "";
      await sendPrompt(prompt);
    });

    abortBtn.addEventListener("click", async () => {
      if (!sessionId) return;
      await fetch("/api/sessions/" + encodeURIComponent(sessionId) + "/abort", { method: "POST" });
      appendBubble("Abort requested.", "system");
      setBusy(false);
    });

    clearBtn.addEventListener("click", () => {
      logEl.innerHTML = "";
    });

    newSessionBtn.addEventListener("click", () => {
      closeStream();
      sessionId = null;
      assistantBuffer = "";
      logEl.innerHTML = "";
      setBusy(false);
      appendBubble("Started a new session.", "system");
    });

    loadConfig().catch((error) => {
      configBox.textContent = "Failed to load config: " + error.message;
    });
  </script>
</body>
</html>`;
