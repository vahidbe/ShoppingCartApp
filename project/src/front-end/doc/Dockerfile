# maintainer Raziel Carvajal-Gomez <raziel.carvajal-gomez@uclouvain.be>

# this image relies on the nodejs image
from node:alpine
ENV PATH /usr/src/scapp-fe-doc/node_modules/.bin:${PATH}
# your workspace
workdir /usr/src/scapp-fe-doc
# copy the configuration file into the workspace
copy package.json .
# install dependencies
run npm install
# copy source files
copy doczrc.js .
copy src src
# deploy the front end
cmd docz serve
