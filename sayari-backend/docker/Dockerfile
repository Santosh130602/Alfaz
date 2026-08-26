FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates \
    ttf-freefont font-noto font-noto-arabic font-noto-devanagari curl
ENV PUPPETEER_SKIP_DOWNLOAD=true CHROMIUM_PATH=/usr/bin/chromium-browser NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p logs
EXPOSE 4000
CMD ["node","--watch","server.js"]

FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates \
    ttf-freefont font-noto font-noto-arabic font-noto-devanagari curl dumb-init
ENV PUPPETEER_SKIP_DOWNLOAD=true CHROMIUM_PATH=/usr/bin/chromium-browser NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN mkdir -p logs && rm -f .env .env.*
RUN addgroup -g 1001 -S sayari && adduser -u 1001 -S sayari -G sayari && chown -R sayari:sayari /app
USER sayari
EXPOSE 4000
ENTRYPOINT ["dumb-init","--"]
CMD ["node","server.js"]
