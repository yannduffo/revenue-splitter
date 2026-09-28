# syntax=docker/dockerfile:1

#no build step : node24 runs the typescript directly
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

#deps first : this layer stays cached as long as the lockfile doesn't change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

#the official image ships a non-root "node" user
USER node
CMD ["node", "src/index.ts"]
