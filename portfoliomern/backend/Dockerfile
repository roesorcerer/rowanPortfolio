# ---- Stage 1: Build ----
# Install all dependencies (including devDependencies) and compile TypeScript.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — Docker caches this layer so npm install
# only re-runs when dependencies change, not on every code change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Stage 2: Production ----
# Start fresh with only what's needed to run the compiled app.
# This stage has no TypeScript, no devDependencies, no source code.
FROM node:20-alpine

WORKDIR /app

# Non-root user for security — never run containers as root in production.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json package-lock.json ./
# --omit=dev skips devDependencies (vitest, eslint, ts-node, etc.)
RUN npm ci --omit=dev

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

EXPOSE 5000

# Use node directly, not npm — npm adds an unnecessary wrapper process
# that doesn't forward signals properly (SIGTERM for graceful shutdown).
CMD ["node", "dist/server.js"]
