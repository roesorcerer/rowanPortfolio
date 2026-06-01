# ---- Stage 1: Build ----
# Install all dependencies (including devDependencies) and compile TypeScript.
#
# Build context is the repo root (not backend/) so that shared/ — which lives
# alongside backend/ and is imported via ../../../shared/contracts — is
# reachable. The container mirrors the repo layout: backend/ at /app/backend
# and shared/ at /app/shared.
FROM node:20-alpine AS builder

WORKDIR /app/backend

# Copy package files first — Docker caches this layer so npm install
# only re-runs when dependencies change, not on every code change.
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Shared types live outside backend/; mirror the repo layout so relative
# imports (../../../shared/contracts) resolve the same in and out of Docker.
COPY shared/ /app/shared/
COPY backend/tsconfig.json ./
COPY backend/src/ ./src/
RUN npm run build

# ---- Stage 2: Production ----
# Start fresh with only what's needed to run the compiled app.
# This stage has no TypeScript, no devDependencies, no source code.
FROM node:20-alpine

WORKDIR /app

# Non-root user for security — never run containers as root in production.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY backend/package.json backend/package-lock.json ./
# --omit=dev skips devDependencies (vitest, eslint, ts-node, etc.)
RUN npm ci --omit=dev

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/backend/dist ./dist

# Switch to non-root user
USER appuser

EXPOSE 5000

# Use node directly, not npm — npm adds an unnecessary wrapper process
# that doesn't forward signals properly (SIGTERM for graceful shutdown).
CMD ["node", "dist/server.js"]
