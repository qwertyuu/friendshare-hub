FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci

# Copy prisma schema and migrations
COPY backend/prisma ./backend/prisma

# Generate Prisma client
RUN cd backend && npx prisma generate

# Copy source code
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/

# Build the application
RUN npm run build:backend

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only runtime dependencies
RUN npm install -g pm2

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --only=production && npm ci --prefix backend --only=production

# Copy prisma from builder
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma ./backend/node_modules/@prisma

# Copy prisma schema and migrations
COPY backend/prisma ./backend/prisma

# Copy compiled code from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Copy entrypoint script
COPY backend/entrypoint.sh ./backend/
RUN chmod +x ./backend/entrypoint.sh

# Create uploads directory
RUN mkdir -p ./backend/uploads

EXPOSE 3000

# Run migrations and start the server
ENTRYPOINT ["sh", "./backend/entrypoint.sh"]
