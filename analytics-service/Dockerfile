# Stage 1: Builder
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production --ignore-scripts && \
    npm ci --only=development --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma Client with custom output path
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build TypeScript to dist
RUN npm run build

# Verify Prisma client was generated and built files exist
RUN ls -la src/generated/prisma/ && echo "Prisma client generated successfully"
RUN ls -la dist/ && echo "Build output exists"

# Stage 2: Production
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 analytics

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=analytics:nodejs /app/dist ./dist
COPY --from=builder --chown=analytics:nodejs /app/src/generated ./dist/generated
COPY --from=builder --chown=analytics:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Verify the Prisma client is in the correct location
RUN ls -la /app/dist/generated/prisma/ || echo "Prisma client not found in expected location"

# Create .env file with required environment variables
# Note: In production, use Docker secrets or environment variables instead
RUN touch .env && chown analytics:nodejs .env

# Switch to non-root user
USER analytics

# Expose the port the app runs on
EXPOSE 8001

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8001/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
