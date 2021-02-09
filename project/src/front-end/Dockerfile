FROM node:alpine

WORKDIR /usr/src/scapp-front-end

COPY package.json .

RUN npm install

COPY public public
COPY src src

CMD npm start
