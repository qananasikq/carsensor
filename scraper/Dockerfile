FROM mcr.microsoft.com/playwright:v1.58.2-jammy

ENV NODE_ENV=production

WORKDIR /app

COPY scraper/package*.json ./scraper/
RUN cd scraper && npm install --omit=dev && npm cache clean --force

COPY scraper ./scraper
COPY shared ./shared

RUN chown -R pwuser:pwuser /app

WORKDIR /app/scraper
USER pwuser

CMD ["node", "index.js"]
