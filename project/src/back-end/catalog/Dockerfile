# this image relies on the nodejs image
FROM node:6.11-alpine
# set working directory
WORKDIR /usr/src/catalog
# we need CURL to verify that the key-value storage is running (see boot-in-order.sh)
RUN apk update && apk add curl

# let NPM packages be called anywhere within the container
ENV PATH /usr/src/catalog/node_modules/.bin:${PATH}
ADD package.json .
RUN npm install
RUN npm install azure-storage
# source files of the authentication service
ADD gulpfile.js .
ADD src src
ADD boot-in-order.sh .
# string to create tokens (see utils/en-de-coders.js)
ENV TOKEN_SECRET changeme
# header for loggining messages
ENV DEBUG catalog-d
# non empty string use perisitence (with CouchDB)
ENV WITH_PERSISTENT_DATA Y

# name of container running CouchDB
ENV DB_HOST catalog-db
# database name
ENV DB_NAME catalog
# authentication information to CRUD (create/remove/update/delete) objects in our DB
ENV ADMIN_NAME admin
ENV ADMIN_PASSW admin
ENV LOG_URL http://logger-daemon:80
ENV VALIDATION_URL http://validation-daemon:80
ENV DB_URL http://${ADMIN_NAME}:${ADMIN_PASSW}@${DB_HOST}:5984/${DB_NAME}
ENV AZURE_STORAGE_ACCOUNT soukeina
ENV AZURE_STORAGE_ACCESS_KEY L5uuMrU7Fdok+S/gY/COLov5HPWx7O0WSN2/yvxt9MKSY37sGxaImGHDT9v61NNFmc6WRgMQuv6M8FczsPEjyw==

# we now use an script to deploy the authentication service
CMD source boot-in-order.sh
