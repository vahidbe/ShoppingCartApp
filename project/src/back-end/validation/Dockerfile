# this image relies on the nodejs image
FROM node:6.11-alpine
# set working directory
WORKDIR /usr/src/validation-service
# we need CURL to verify that the key-value storage is running (see boot-in-order.sh)
RUN apk update && apk add curl

# let NPM packages be called anywhere within the container
ENV PATH /usr/src/validation-service/node_modules/.bin:${PATH}
ADD package.json .
RUN npm install
# source files of the authentication service
ADD gulpfile.js .
ADD src src
ADD boot-in-order.sh .
# string to create tokens (see utils/en-de-coders.js)
ENV TOKEN_SECRET changeme
# header for loggining messages
ENV DEBUG validation-d
ENV LOG_URL http://logger-daemon:80

# we now use an script to deploy the authentication service
CMD source boot-in-order.sh
