# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci                     # install deps (no dev‑dependencies unless you need them)
COPY . .
RUN npm run build              # Vite creates ./dist

# ---------- Runtime ----------
FROM nginx:stable-alpine AS runtime

# Copy the compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
