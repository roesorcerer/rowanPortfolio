# ---- Stage 1: Build ----
# Install dependencies and build the React app into static files.
#
# Build context is the repo root (not frontend/), for the same reason as the
# backend image: the API modules import ../../../shared/contracts, and
# shared/ lives beside frontend/. The container mirrors the repo layout —
# frontend/ at /app/frontend, shared/ at /app/shared — so the relative import
# and tsconfig's "../shared/**/*.d.ts" include resolve the same in and out of
# Docker. Built from frontend/ alone, tsc can't see the contract and fails.
#
# The root .dockerignore excludes frontend/ to keep the backend upload to Fly
# small, so this image has its own allowlist in Dockerfile.dockerignore next
# to this file. BuildKit prefers that file over the root one for this build.
FROM node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY shared/ /app/shared/
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Serve ----
# Serve the static build output with nginx.
# nginx is tiny (~25MB), fast, and handles caching/compression/routing.
FROM nginx:alpine

# Copy our custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/frontend/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
