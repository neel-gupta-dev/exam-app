# Stage 1: Install dependencies
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use 'npm ci' for faster, more reliable builds in CI/Docker
RUN npm ci

# Stage 2: Build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disabling telemetry during build (optional)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Production runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder
# Note: You MUST have 'output: "standalone"' in your next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
