# ---- Stage 1: Build ----
# Install dependencies and build the React app into static files.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
# Serve the static build output with nginx.
# nginx is tiny (~25MB), fast, and handles caching/compression/routing.
FROM nginx:alpine

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
