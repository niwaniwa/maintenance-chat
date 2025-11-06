import { Hono } from 'hono'
import { serve } from '@hono/cloudflare-workers'

// In-memory store for messages (will reset when worker restarts)
const messages = []

const app = new Hono()

app.get('/', (c) => {
  return c.html(`
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
  `)
})

app.get('/messages', (c) => c.json(messages))

app.post('/messages', async (c) => {
  const { name, text } = await c.req.json()
  messages.push({ name, text, time: Date.now() })
  if (messages.length > 100) messages.shift() // keep latest 100
  return c.json({ ok: true })
})

export default app
serve(app)
