# Builds the React app, then serves it plus the API from one Node process.
# Mirrors the porpoise deployment: node:22-slim + a Fly volume for the SQLite DB.

# --- Stage 1: build the frontend ---
FROM node:22-slim AS frontend

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Empty base URL: in production the API is same-origin
ENV REACT_APP_API_URL=""
RUN npm run build

# --- Stage 2: the server ---
FROM node:22-slim

# better-sqlite3 is a native addon and needs a toolchain to build
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./
# The built UI is served from /app/public by index.js
COPY --from=frontend /build/build ./public

RUN mkdir -p /data

EXPOSE 3002

ENV PORT=3002 \
    DB_PATH=/data/db.sqlite \
    NODE_ENV=production

CMD ["node", "index.js"]
