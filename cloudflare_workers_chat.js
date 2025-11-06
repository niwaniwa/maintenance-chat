const messages = []

function renderHtml() {
  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Maintenance Chat</title>
        <style>
          body { font-family: sans-serif; background: #f0f0f0; margin: 0; padding: 0; }
          #chat { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          #messages { height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
          input, button { padding: 10px; font-size: 1em; }
          button { margin-left: 5px; }
        </style>
      </head>
      <body>
        <div id="chat">
          <h2>🛠️ Maintenance Chat</h2>
          <div id="messages"></div>
          <input id="name" placeholder="Name" />
          <input id="message" placeholder="Message" />
          <button id="send">Send</button>
        </div>
        <script>
          const messagesEl = document.getElementById('messages');
          const nameEl = document.getElementById('name');
          const messageEl = document.getElementById('message');
          const sendBtn = document.getElementById('send');

          async function loadMessages() {
            const res = await fetch('/messages');
            const data = await res.json();
            messagesEl.innerHTML = data.map(m => `<p><b>${m.name}</b>: ${m.text}</p>`).join('');
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }

          sendBtn.onclick = async () => {
            const name = nameEl.value.trim() || 'Anonymous';
            const text = messageEl.value.trim();
            if (!text) return;
            await fetch('/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, text })
            });
            messageEl.value = '';
            await loadMessages();
          };

          setInterval(loadMessages, 2000);
          loadMessages();
        </script>
      </body>
    </html>
  `
}

async function handleMessages(request, method) {
  if (method === 'GET') {
    return new Response(JSON.stringify(messages), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }

  try {
    const { name, text } = await request.json()
    if (typeof text !== 'string' || text.trim() === '') {
      return new Response(JSON.stringify({ ok: false, error: 'Message text is required.' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      })
    }
    const entry = {
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Anonymous',
      text: text.trim(),
      time: Date.now(),
    }
    messages.push(entry)
    if (messages.length > 100) {
      messages.shift()
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/') {
      return new Response(renderHtml(), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
    }

    if (url.pathname === '/messages' && (request.method === 'GET' || request.method === 'POST')) {
      return handleMessages(request, request.method)
    }

    return new Response('Not found', { status: 404 })
  },
}
