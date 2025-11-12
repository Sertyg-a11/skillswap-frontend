# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---------- Runtime (supports envsubst) ----------
FROM nginx:1.27-alpine

# Static files
COPY --from=build /app/dist /usr/share/nginx/html

# Template (note: .template!)
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose 8080 like before
EXPOSE 8080


# (image already runs as non-root user:101)
