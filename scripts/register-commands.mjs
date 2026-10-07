const appId = process.env.DISCORD_APP_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!appId || !token) {
  console.error("Missing env vars. Set DISCORD_APP_ID and DISCORD_BOT_TOKEN (optionally DISCORD_GUILD_ID).");
  process.exit(1);
}

const command = {
  name: "verify",
  description: "Get a link to verify your Roblox account",
};

const base = `https://discord.com/api/v10/applications/${appId}/commands`;
const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : base;

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(command),
});

const text = await res.text();
console.log(`status ${res.status}`);
console.log(text);

if (!res.ok) process.exit(1);
console.log(guildId ? "Registered guild command (instant)." : "Registered global command (may take up to ~1 hour to appear).");
