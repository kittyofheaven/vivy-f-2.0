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

client.on("messageCreate", (message) => {
  // Filter: hanya allowed channel dan/atau DM
  const isDM = message.guild === null;
  const isAllowedChannel = config.allowedChannels.includes(message.channel.id);
  if (!isDM && !isAllowedChannel) return;
  if (isDM && !config.allowDirectMessage) return;

  if (message.content === "!ping") {
    message.channel.send("Pong!");
  }
});

client.login(process.env.DISCORD_TOKEN);
