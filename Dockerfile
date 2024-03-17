# Stage 1: Build
FROM node:21-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Stage 2: Run
FROM node:21-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY . .
# COPY ./serviceKey.json ./serviceKey.json
# COPY .env .env
# COPY package*.json ./ 

# COPY package*.json ./

EXPOSE 8080

CMD ["npm", "start"]
