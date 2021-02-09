#!/bin/bash -
#===============================================================================
#
#          FILE: plot.sh
#
#         USAGE: ./plot.sh
#
#   DESCRIPTION:
#
#       OPTIONS: ---
#  REQUIREMENTS: ---
#          BUGS: ---
#         NOTES: ---
#        AUTHOR: Raziel Carvajal-Gomez (raziel.carvajal@uclouvain.be), Paolo Laffranchini (paolo.laffranchini@student.uclouvain.be)
#  ORGANIZATION:
#       CREATED: 04/19/2018 20:24
#      REVISION:  ---
#===============================================================================
# any environment variable in this script is defined, this should
# be done during the deployment of a service or in a Dockerfile

curl ${COUCHDB_URL}/_design/queries/_view/movies_per_category?group=true >> result_set.json

Rscript plot.R --vanilla
mv *.pdf plots
