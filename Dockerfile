# Stage 1: Build
FROM node:14-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Stage 2: Run
FROM node:14-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY ./src ./src
COPY package*.json ./

# COPY package*.json ./

EXPOSE 8080

CMD ["npm", "start"]
