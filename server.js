const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "pauloforge2026";
const TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_ID = process.env.PHONE_NUMBER_ID || "";

function gerarResposta(texto) {
  const t = (texto || "").toLowerCase().trim();
  if (t.includes("oi") || t.includes("ol") || t.includes("menu")) {
    return "Olá! 👋 Sou o atendente virtual da PauloForge Soluções 🤖️\n\nEscolha:\n1️⃣ Ver serviços\n2️⃣ Pedir orçamento\n3️⃣ Horário\n4️⃣ Falar com humano";
  }
  if (t.startsWith("1")) return "🛠️ *Serviços:*\n• Atendimento automático no WhatsApp 24h\n• Cardápio digital com pedidos\n• Ferramentas pra pequenos negócios\n\nDigite 2 pra orçamento!";
  if (t.startsWith("2")) return "📝 Anotado! O Paulo te chama no humano em até 1h. 😉";
  if (t.startsWith("3")) return "🕐 Humano: seg a sáb, 8h–18h.\nO robô nunca dorme! 😄";
  if (t.startsWith("4")) return "🙋 Chamando o Paulo! Já já ele assume aqui.";
  return "Não entendi 😅 Digite 1, 2, 3 ou 4.";
}

app.get("/", (req, res) => res.send("⚒️ PauloForge no ar!"));

app.get("/webhook", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (!msg?.text?.body) return;
    const de = msg.from;
    const resposta = gerarResposta(msg.text.body);
    console.log(`📩 ${de}: "${msg.text.body}"`);
    const r = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: de, type: "text", text: { body: resposta } })
    });
    const j = await r.json();
    console.log(r.ok ? "✅ Enviado!" : `❌ ${JSON.stringify(j)}`);
  } catch (e) { console.error(e); }
});

app.listen(process.env.PORT || 3000, () => console.log("🔥 Bot online"));
