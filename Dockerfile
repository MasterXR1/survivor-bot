# Self-host Survivor Bot as a static site behind your own domain.
#
#   docker build -t survivor-bot-web .
#   docker run -d --name survivor-web --restart unless-stopped -p 127.0.0.1:8080:80 survivor-bot-web
#
# Then put a reverse proxy with HTTPS (Caddy, nginx + certbot, Cloudflare Tunnel) in front of it,
# pointing your domain at 127.0.0.1:8080. HTTPS is required for the service worker (install /
# offline support) to work on a real domain - browsers only allow it on https:// or localhost.
FROM nginx:alpine
COPY index.html manifest.json sw.js icon.svg icon-maskable.svg /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
