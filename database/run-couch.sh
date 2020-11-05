#!/usr/bin/env bash

COUCHDB_USER="admin"
COUCHDB_PASSWORD="admin"

COUCHDB_CONTAINER=$(docker run \
    --name auth-couchdb \
    -d \
    -p 5984:5984 \
    -e COUCHDB_USER=$COUCHDB_USER \
    -e COUCHDB_PASSWORD=$COUCHDB_PASSWORD \
    -v "$(pwd)/etc:/opt/couchdb/etc/local.d" \
    couchdb:3)

echo -e "waiting for couchdb startup...\c"

until nc -z "$(docker inspect --format='{{.NetworkSettings.IPAddress}}' "$COUCHDB_CONTAINER")" 5984
do
    echo -e ".\c"
    sleep 1
done

echo

echo "creating system databases..."

echo "_users:"
curl -sS -u $COUCHDB_USER:$COUCHDB_PASSWORD -X PUT http://127.0.0.1:5984/_users

echo "_replicator:"
curl -sS -u $COUCHDB_USER:$COUCHDB_PASSWORD -X PUT http://127.0.0.1:5984/_replicator

echo "_global_changes:"
curl -sS -u $COUCHDB_USER:$COUCHDB_PASSWORD -X PUT http://127.0.0.1:5984/_global_changes
