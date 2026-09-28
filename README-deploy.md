# Self-hosting Survivor Bot

Everything in this folder is a **static site** - six files, no backend, no build step.
Put them on any web host or your own server and point your domain at them.

```
index.html          the app
manifest.json        \
sw.js                 } PWA support: installable, works offline for the app shell
icon.svg              |
icon-maskable.svg    /
Dockerfile, nginx.conf   optional: for self-managed hosting (see below)
```

Paper trading, the market tab, the optimiser and the AI assistant (inside Claude) all work
straight away. Live Binance prices and real Hyperliquid trading need the page to be reachable
over the internet by the browser making the calls - both work once this is hosted (they didn't
work when the file was opened directly from disk as `file://`).

## Option A - a static hosting service (free, no server to manage)
Any of these work by uploading the folder as-is:

- **Netlify** - drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or `netlify deploy`.
- **Vercel** - `npx vercel` from inside this folder.
- **Cloudflare Pages** - connect a repo, or `npx wrangler pages deploy .`.
- **GitHub Pages** - push this folder to a repo and enable Pages on it (Settings > Pages).

All four give you HTTPS and a URL immediately; add your own domain afterwards in that
service's dashboard (a CNAME or A record at your DNS provider). No server-side code runs, so
there's nothing to configure beyond pointing DNS at the host.

## Option B - your own server (Docker + nginx)
```bash
docker build -t survivor-bot-web .
docker run -d --name survivor-web --restart unless-stopped -p 127.0.0.1:8080:80 survivor-bot-web
```
This serves the files on `127.0.0.1:8080`. Put a reverse proxy with HTTPS in front of it and
point your domain at your server:
- **Caddy** (simplest, automatic HTTPS): `your-domain.com { reverse_proxy 127.0.0.1:8080 }` in a `Caddyfile`.
- **nginx + certbot**: a standard `proxy_pass http://127.0.0.1:8080;` server block, then
  `certbot --nginx -d your-domain.com`.
- **Cloudflare Tunnel**: `cloudflared tunnel --url http://127.0.0.1:8080` needs no open ports at all.

If you'd rather skip Docker, `nginx.conf` in this folder is a ready-made nginx server block -
copy the five app files into nginx's web root and drop this config into `conf.d/`.

## HTTPS is required
Browsers only allow a service worker (install-to-home-screen, offline support) on `https://`
or `localhost`. A static host from Option A gives you this automatically; for Option B, make
sure the reverse proxy step is in place before expecting install/offline to work - the app
itself still works fine over plain HTTP, just without those two extras.

## Updating
These five files are a plain copy of the published app. If you ask Claude to change the app
again later, ask it to also update this `webapp/` folder (or just re-copy `survivor_bot.html`
over `index.html` and reapply the manifest/service-worker `<head>` lines - they're marked with
a `setupPWA()` comment near the top of the script).
