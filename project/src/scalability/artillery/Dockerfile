# this image relies on the nodejs image
FROM node:latest

WORKDIR /usr/src/artillery

RUN apt-get update && apt-get install -y curl
RUN npm install artillery

# let NPM packages be called anywhere within the container
ENV PATH /usr/src/artillery/node_modules/.bin:${PATH}

ADD login-user-load-test.yml .

CMD curl --request POST -d 'username=bob&password=alice' scapp_users-daemon/user && \
  artillery run login-user-load-test.yml
