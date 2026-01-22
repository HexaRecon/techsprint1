FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY turbo.json .
COPY packages/api/package.json ./packages/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN npm install

COPY packages/api ./packages/api
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config

WORKDIR /app/packages/api

CMD ["npm", "run", "dev"]
