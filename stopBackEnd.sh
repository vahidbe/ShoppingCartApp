#
# This script can be run to stop scapp deployed on a swarm leader 
#

docker stack rm scapp
echo "Stopped back-end"
