FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev && npm cache clean --force

COPY backend ./backend
COPY shared ./shared

RUN chown -R node:node /app

WORKDIR /app/backend
USER node

EXPOSE 4000
CMD ["npm", "start"]
