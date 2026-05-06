# ⚡ NovaSpark TURBO — Minimal Docker image for fast deployment
FROM node:20-alpine AS base

# Install only required native deps for sharp
RUN apk add --no-cache vips-dev

WORKDIR /app

# Install deps first (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild sharp && \
    npm cache clean --force

# Copy source
COPY . .

# Remove dev files
RUN rm -rf .git node_modules/.cache

# Runtime config
ENV NODE_ENV=production
ENV SESSION_DIR=session

# Start with memory optimization
CMD ["node", "--max-old-space-size=256", "--optimize-for-size", "index.js"]
