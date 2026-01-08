FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/tailwind.config.ts ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/index.html ./frontend/

# Build the application
RUN npm run build:frontend

# Production stage - Nginx
FROM nginx:alpine

# Copy nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/

# Copy built application from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy runtime environment script
# nginx:alpine exécute automatiquement les scripts .sh dans /docker-entrypoint.d/
COPY frontend/runtime-env.sh /docker-entrypoint.d/10-inject-runtime-env.sh
RUN chmod +x /docker-entrypoint.d/10-inject-runtime-env.sh

EXPOSE 80

# CMD par défaut de nginx:alpine - les scripts dans /docker-entrypoint.d/ s'exécutent avant
CMD ["nginx", "-g", "daemon off;"]
