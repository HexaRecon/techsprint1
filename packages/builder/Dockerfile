FROM node:18-alpine

# Install Docker CLI
RUN apk add --no-cache docker-cli git

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY turbo.json .
COPY packages/builder/package.json ./packages/builder/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN npm install

COPY packages/builder ./packages/builder
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config

WORKDIR /app/packages/builder

CMD ["npm", "run", "dev"]
