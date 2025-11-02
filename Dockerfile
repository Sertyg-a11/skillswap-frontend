# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Improve caching
COPY package*.json ./
RUN npm ci

# Copy sources and build (Vite/React -> /dist)
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---------- Runtime stage (non-root) ----------
# NGINX unprivileged listens on 8080 and runs as UID 101
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Copy static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Provide a minimal nginx config with API proxy (no templating)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck on static file
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1

# Expose unprivileged port
EXPOSE 8080

# (image already runs as non-root user:101)
