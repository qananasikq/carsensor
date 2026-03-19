FROM node:20-alpine AS deps

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package*.json ./
COPY frontend/next.config.js ./next.config.js
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

RUN chown -R node:node /app

USER node

EXPOSE 3000
CMD ["npm", "run", "start"]
