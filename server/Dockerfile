# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (better caching)
COPY package*.json tsconfig.json ./

# Install all dependencies (including dev, for tsc & prisma)
RUN npm install

# Copy source code and prisma schema
COPY src ./src
COPY prisma ./prisma
COPY .env .env

# Build TypeScript -> dist/
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built app, prisma schema, and views
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/views ./dist/views

# Generate Prisma client at runtime
RUN npx prisma generate

# Set environment
ENV NODE_ENV=production
EXPOSE 3000

# Start server (with Prisma migrations just in case)
CMD ["sh", "-c", "npm start"]
