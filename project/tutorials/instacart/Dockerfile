# MAINTAINER Raziel Carvajal-Gomez <raziel.carvajal-gomez@uclouvain.be>
FROM node:6.11-alpine

WORKDIR /usr/src/app

RUN apk update
RUN apk add curl

RUN npm install debug

ADD jsons jsons
ADD views views
ADD func_to_string.js .
ADD wait-for-couchdb.sh .

ENV DB_URL admin:admin@users-db:5984/instacart

CMD source wait-for-couchdb.sh
