# ===========================================
# Bium - Unified Dockerfile
# Frontend (React/Vite) + Backend (Node.js/Express)
# ===========================================

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production=false
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production=false
COPY backend/ ./
RUN npm run build

# Stage 3: Production Image
FROM node:18-alpine AS production

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy backend build and production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy frontend build to nginx html directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

# Create data directory for lowdb
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_PATH=/app/data

# Expose ports
EXPOSE 80 3000

# Start supervisor (manages nginx + node)
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
