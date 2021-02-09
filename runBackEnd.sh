#!/bin/bash
#
# This script can be run to deploy scapp on a swarm leader 
#

local=false
yml="scapp"
if [ "$1" = true ]
then 
    yml="scapp_local" 
    local="true"
fi
echo "Use local images: $local"
echo "Configuration file: $yml.yml"
docker stack deploy -c ./project/src/$yml.yml scapp 2>/dev/null
docker stack deploy -c $yml.yml scapp 2>/dev/null
docker stack services scapp
echo "Back-end started"