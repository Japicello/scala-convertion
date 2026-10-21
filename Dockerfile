# ==========================================
# Base stage: Node.js + Headless LibreOffice
# ==========================================
FROM node:20-bookworm-slim AS base

# Install LibreOffice and core fonts for accurate document-to-pdf conversion
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-liberation \
    fonts-dejavu-core \
    default-jre-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ==========================================
# Builder stage: compile TypeScript
# ==========================================
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Production runner stage
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
