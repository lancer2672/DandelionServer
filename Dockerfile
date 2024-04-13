FROM node:21-alpine

WORKDIR /app

COPY . ./
COPY serviceKey.json ./serviceKey.json
COPY private.key ./private.key

RUN npm ci 

EXPOSE 3000

CMD ["npm", "start"]
