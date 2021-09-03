# ------------------------------------------
# production version
# ------------------------------------------
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf
RUN npm install --only=development

COPY . .

RUN apk add --no-cache bash

RUN npm run build

CMD ["npm", "run", "start:prod"]
