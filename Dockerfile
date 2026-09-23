# ==============================================================================
# Tech Battle Royale - Production Dockerfile for Google Cloud Run
# ==============================================================================

FROM node:20-alpine AS base

# Install dumb-init for proper signal forwarding & zombie reaping in containers
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Set production environment and Cloud Run default port
ENV NODE_ENV=production
ENV PORT=8080

# Switch to standard non-root user provided by node image
USER node

EXPOSE 8080

# Start via dumb-init for graceful SIGTERM shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]

