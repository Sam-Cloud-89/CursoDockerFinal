FROM node:26 AS builder

WORKDIR /app

COPY ./package*.json ./

RUN npm ci 

COPY . .




FROM node:26-slim

WORKDIR /app 

COPY --from=builder /app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["node","index.js"]









