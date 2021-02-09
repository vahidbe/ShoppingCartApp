#!/bin/bash

image="vahidbe/scapp-frontend:latest"
ip=$1
local=false
if [ "$2" = true ]
then 
    image="scapp-frontend" 
    local=true
fi
if [ ! "$2" = true ]
then
    docker pull $image
fi
echo "Back-end IP address: $ip"
echo "Use local images: $local"
echo "Front-end image: $image"

./stopFrontEnd.sh >/dev/null 2>&1
docker run -d \
-e REACT_APP_LOGGER_SERVICE_URL=$ip:3004 \
-e REACT_APP_AUTH_SERVICE_URL=$ip:3001 \
-e REACT_APP_CATALOG_SERVICE_URL=$ip:3011 \
-e REACT_APP_CART_SERVICE_URL=$ip:3009 \
-e REACT_APP_ORDER_SERVICE_URL=$ip:3007 \
-e REACT_APP_RECOMMENDATION_SERVICE_URL=$ip:3012 \
-p 3003:80 --name scapp-frontend $image
echo "Front-end started"