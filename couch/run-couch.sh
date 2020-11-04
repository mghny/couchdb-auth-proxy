#!/usr/bin/env bash

docker run \
    --name auth-couchdb \
    -d \
    -p 5984:5984 \
    -e COUCHDB_USER=admin \
    -e COUCHDB_PASSWORD=admin \
    -v "$(pwd)/etc:/opt/couchdb/etc/local.d" \
    couchdb:3
