// index.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "configure.json");
let config = { allowedChannels: [], allowDirectMessage: false };
try {
  const configRaw = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(configRaw);
} catch (err) {
  console.warn("Could not read configure.json, using default config.", err);
}
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Filter: hanya allowed channel dan/atau DM
  const isDM = message.guild === null;
  const isAllowedChannel = config.allowedChannels.includes(message.channel.id);
  if (!isDM && !isAllowedChannel) return;
  if (isDM && !config.allowDirectMessage) return;

  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL is not set in .env");
      return;
    }
    // Kirim chat ke webhook n8n
    await axios.post(
      webhookUrl,
      {
        user: message.author.username,
        userId: message.author.id,
        channelId: message.channel.id,
        content: message.content,
        isDM,
        timestamp: message.createdAt,
      }
    );
    // await message.channel.send("message received");
  } catch (err) {
    console.error("Failed to send message to webhook:", err);
  }

  if (message.content === "!ping") {
    message.channel.send("Pong!");
  }
});

const express = require("express");
const app = express();
app.use(express.json());

app.post("/n8n-response", async (req, res) => {
  const { channelId, message } = req.body;
  if (!channelId || !message) {
    return res
      .status(400)
      .json({ error: "channelId and message are required" });
  }
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }
    await channel.send(message);
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Failed to send message to Discord:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
