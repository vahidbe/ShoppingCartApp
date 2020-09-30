# this image relies on the nodejs image
FROM node:6.11-alpine
# set working directory
WORKDIR /usr/src/auth-service
#
ENV PATH /usr/src/auth-service/node_modules/.bin:${PATH}

ENV TOKEN_SECRET changeme
ENV DEBUG users-d

ADD package.json .
RUN npm install
#
ADD gulpfile.js .
ADD src src

CMD npm start
