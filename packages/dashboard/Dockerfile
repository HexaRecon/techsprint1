FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY turbo.json .
COPY packages/dashboard/package.json ./packages/dashboard/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

RUN npm install

COPY packages/dashboard ./packages/dashboard
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config
COPY packages/ui ./packages/ui

WORKDIR /app/packages/dashboard

EXPOSE 3000

CMD ["npm", "run", "dev"]
