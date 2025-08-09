# Multi-stage build for production optimization
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxtjs -u 1001

# Copy built application
COPY --from=builder /app/.output /app/.output

# Set ownership to non-root user
RUN chown -R nuxtjs:nodejs /app

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node .output/server/health.js || exit 1

# Start application
CMD ["node", ".output/server/index.mjs"]
