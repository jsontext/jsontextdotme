const ROBLOX_AUTHORIZE = "https://apis.roblox.com/oauth/v1/authorize";
const ROBLOX_TOKEN = "https://apis.roblox.com/oauth/v1/token";
const ROBLOX_USERINFO = "https://apis.roblox.com/oauth/v1/userinfo";
const DISCORD_API = "https://discord.com/api/v10";

const TOKEN_TTL_SECONDS = 60 * 15;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/verify") {
        return await handleVerify(url, env);
      }
      if (url.pathname === "/callback") {
        return await handleCallback(url, env);
      }
      if (url.pathname === "/discord" && request.method === "POST") {
        return await handleDiscord(request, env);
      }
    } catch (err) {
      console.error("verify flow error", err && err.stack ? err.stack : err);
      return errorPage("Something went wrong. Please try again or contact staff.");
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleVerify(url, env) {
  const token = url.searchParams.get("t");
  const payload = token ? await verifyToken(token, env.HMAC_SECRET) : null;

  if (!payload || !payload.d) {
    return errorPage("This verification link is invalid or has expired. Please run /verify again in Discord.");
  }

  const authorize = new URL(ROBLOX_AUTHORIZE);
  authorize.searchParams.set("client_id", env.ROBLOX_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", env.ROBLOX_REDIRECT_URI);
  authorize.searchParams.set("scope", "openid profile");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("state", token);

  return Response.redirect(authorize.toString(), 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const payload = state ? await verifyToken(state, env.HMAC_SECRET) : null;

  if (!payload || !payload.d) {
    return errorPage("Verification session expired. Please run /verify again in Discord.");
  }
  if (!code) {
    return errorPage("Roblox did not return an authorization code. Please try again.");
  }

  const tokens = await exchangeCode(code, env);
  if (!tokens || !tokens.access_token) {
    return errorPage("Could not complete Roblox login. Please try again.");
  }

  const user = await fetchUserInfo(tokens.access_token);
  if (!user || !user.sub) {
    return errorPage("Could not read your Roblox profile. Please try again.");
  }

  const grant = await grantRole(payload.d, env);
  if (!grant.ok) {
    return errorPage(grant.message);
  }

  const username = user.preferred_username || user.name || "";
  const back = new URL("/", url.origin);
  back.searchParams.set("verify", "success");
  if (username) back.searchParams.set("username", username);
  return Response.redirect(back.toString(), 302);
}

async function exchangeCode(code, env) {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("client_id", env.ROBLOX_CLIENT_ID);
  body.set("client_secret", env.ROBLOX_CLIENT_SECRET);

  const res = await fetch(ROBLOX_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    console.error("token exchange failed", res.status, await res.text());
    return null;
  }
  return res.json();
}

async function fetchUserInfo(accessToken) {
  const res = await fetch(ROBLOX_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error("userinfo failed", res.status, await res.text());
    return null;
  }
  return res.json();
}

async function grantRole(discordId, env) {
  const res = await fetch(
    `${DISCORD_API}/guilds/${env.DISCORD_GUILD_ID}/members/${discordId}/roles/${env.DISCORD_ROLE_ID}`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
    }
  );

  if (res.status === 204 || res.ok) {
    return { ok: true };
  }
  if (res.status === 404) {
    return { ok: false, message: "You are not a member of the server. Join the Discord server first, then run /verify." };
  }
  if (res.status === 403) {
    return { ok: false, message: "The bot lacks permission to grant the role. Contact staff." };
  }

  const detail = await res.text();
  console.error("role grant failed", res.status, detail);
  return { ok: false, message: "Could not grant your role. Contact staff." };
}

async function handleDiscord(request, env) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();

  const valid = await verifyDiscordSignature(env.DISCORD_PUBLIC_KEY, signature, timestamp, body);
  if (!valid) {
    return new Response("invalid request signature", { status: 401 });
  }

  let interaction;
  try {
    interaction = JSON.parse(body);
  } catch {
    return jsonResponse({ error: "bad request" }, 400);
  }

  if (interaction.type === 1) {
    return jsonResponse({ type: 1 });
  }

  if (interaction.type === 2 && interaction.data && interaction.data.name === "verify") {
    const userId =
      (interaction.member && interaction.member.user && interaction.member.user.id) ||
      (interaction.user && interaction.user.id);

    if (!userId) {
      return jsonResponse({ type: 4, data: { content: "Could not read your Discord user ID.", flags: 64 } });
    }

    const token = await createToken({ d: userId }, env.HMAC_SECRET);
    const origin = new URL(request.url).origin;
    const link = `${origin}/?t=${token}`;

    return jsonResponse({
      type: 4,
      data: {
        content: `**Verify your Roblox account**\n[Click here to verify](${link})\n\nThis link expires in 15 minutes.`,
        flags: 64,
      },
    });
  }

  return jsonResponse({ type: 4, data: { content: "Unknown command.", flags: 64 } });
}

async function verifyDiscordSignature(publicKeyHex, signatureHex, timestamp, body) {
  if (!publicKeyHex || !signatureHex || !timestamp) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBytes(publicKeyHex),
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      hexToBytes(signatureHex),
      new TextEncoder().encode(timestamp + body)
    );
  } catch (err) {
    console.error("discord signature verify error", err && err.message ? err.message : err);
    return false;
  }
}

function hexToBytes(hex) {
  const clean = String(hex).trim();
  if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) {
    throw new Error("invalid hex");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorPage(message) {
  const safe = String(message)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verification</title>
<style>
  html,body{margin:0;height:100%;background:#fbfbfb;color:#2c2c2c;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{max-width:420px;text-align:center}
  h1{font-size:18px;font-weight:600;margin:0 0 12px}
  p{font-size:14px;line-height:1.6;color:#5a5a5a;margin:0 0 20px}
  a{font-size:14px;color:#2c2c2c}
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Verification</h1>
      <p>${safe}</p>
      <a href="/">Back to jsontext.me</a>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function createToken(data, secret, ttlSeconds = TOKEN_TTL_SECONDS) {
  const payload = { ...data, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(encoded, secret);
  return `${encoded}.${sig}`;
}

async function verifyToken(token, secret) {
  const parts = String(token).split(".");
  if (parts.length !== 2) return null;

  const [encoded, sig] = parts;
  const valid = await hmacVerify(encoded, sig, secret);
  if (!valid) return null;

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded)));
  } catch {
    return null;
  }

  if (!payload || typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function hmacSign(message, secret) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64UrlEncode(new Uint8Array(sig));
}

async function hmacVerify(message, signature, secret) {
  const key = await hmacKey(secret);
  let sigBytes;
  try {
    sigBytes = base64UrlDecode(signature);
  } catch {
    return false;
  }
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(message));
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str) {
  let s = String(str).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export { createToken };
