FROM node:18-alpine as build

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY src ./src
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY .swcrc .
COPY nest-cli.json .

RUN npx prisma generate
RUN npm run build


#FROM node:16-alpine3.14
FROM node:18-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist  ./dist
COPY tsconfig.json .
COPY package.json .

EXPOSE 4000



CMD ["npm", "run", "start:prod"]
