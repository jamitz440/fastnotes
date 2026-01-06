# ==== frontend/Dockerfile (production) ====

# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci                     # clean install, respects lockfile

COPY . .
RUN npm run build              # Vite outputs to ./dist

# ---------- Runtime ----------
FROM nginx:stable-alpine AS runtime

# Copy the compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
