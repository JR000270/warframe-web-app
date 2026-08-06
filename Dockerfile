# Stage 1: Build the Vite React App
# Upgrade to Node 22 Alpine (LTS) for patched OS libraries
FROM node:22-alpine AS builder

WORKDIR /app

# Update system packages to clear scanner OS-level CVE alerts
RUN apk update && apk upgrade --no-cache

# Copy dependency manifests from the build context root
COPY package.json package-lock.json ./

# Execute a clean install using the lockfile
RUN npm ci

# Copy remaining project files and build
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
# Using alpine-slim or latest alpine Nginx to minimize attack surface
FROM nginx:alpine AS production

# Remove default static web assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled production build from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]