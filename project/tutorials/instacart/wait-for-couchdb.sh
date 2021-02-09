#!/bin/bash -
#===============================================================================
#
#          FILE: wait-for-couchdb.sh
#
#         USAGE: ./wait-for-couchdb.sh
#
#   DESCRIPTION:
#
#       OPTIONS: ---
#  REQUIREMENTS: ---
#          BUGS: ---
#         NOTES: ---
#        AUTHOR: Raziel Carvajal-Gomez (), raziel.carvajal@uclouvain.be
#  ORGANIZATION:
#       CREATED: 10/22/2019 00:12
#      REVISION:  ---
#===============================================================================

until curl --request PUT ${DB_URL} ; do
  echo "Users DB wasn't created - sleeping"
  sleep 1
done
echo "DB created!"

cd jsons
source fill_db.sh ${DB_URL}
cd ..

echo "Apply a formatter for each view"
mkdir formatter_output
DEBUG=views* node func_to_string.js
if [[ ${?} != 0 ]]; then
  echo -e "ERROR: during the creation of views\nEND OF \{0}"
  exit 1
fi
echo -e "\tDONE"

cd formatter_output
echo "Creation of views for users DB"
for view in `ls *.js`; do
  curl --request PUT "${DB_URL}/_design/queries" --upload-file ${view}
  if [[ ${?} != 0 ]]; then
    echo -e "ERROR: during the creation of view ${view}\nEND OF \{0}"
    exit 1
  fi
done
echo -e "\tDONE"

echo "END OF ${0}"
