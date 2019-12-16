#!/usr/bin/env bash

docker pull amazon/dynamodb-local
id=$(docker run -d -p 8000:8000 amazon/dynamodb-local)
# make sure dynamodb container is ready
sleep 10s
node index.js
docker stop $id
