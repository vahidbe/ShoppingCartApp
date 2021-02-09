# this image relies on the nodejs image
FROM node:6.11-alpine
# set working directory
WORKDIR /usr/src/cart
# we need CURL to verify that the key-value storage is running (see boot-in-order.sh)
RUN apk update && apk add curl

# let NPM packages be called anywhere within the container
ENV PATH /usr/src/cart/node_modules/.bin:${PATH}
ADD package.json .
RUN npm install
# source files of the authentication service
ADD gulpfile.js .
ADD src src
ADD boot-in-order.sh .
# header for loggining messages
ENV DEBUG cart-d
# non empty string use perisitence (with CouchDB)
ENV WITH_PERSISTENT_DATA Y

# name of container running CouchDB
ENV DB_HOST cart-db
# database name
ENV DB_NAME cart
# authentication information to CRUD (create/remove/update/delete) objects in our DB
ENV ADMIN_NAME admin
ENV ADMIN_PASSW admin
ENV LOG_URL http://logger-daemon:80
ENV VAL_URL http://validation-daemon:80
ENV ORD_URL http://orders-daemon:80
ENV DB_URL http://${ADMIN_NAME}:${ADMIN_PASSW}@${DB_HOST}:5984/${DB_NAME}

# we now use an script to deploy the authentication service
CMD source boot-in-order.sh
