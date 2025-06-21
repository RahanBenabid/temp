#!/usr/bin/env bash

set -euo pipefail

source "./checkServer.sh"

# CLIENT DASHBOARD API TEST --------

echo "Creating a client instance"
response=$(curl -s -X POST http://localhost:3000/users \
  --header "Content-Type: application/json" \
  --data '{
    "firstname": "client",
    "lastname": "man",
    "phone": "0542098183",
    "email": "client@mail.com",
    "password": "0000",
    "address": "Setif 19000 something something"
  }')
echo -e
echo $response
user_id=$(echo $response | jq -r '.user.id')
echo -e "$user_id\n"

echo "Logging in as a client..."
json=$(curl -s -X POST http://localhost:3000/users/login \
  --header "Content-Type: application/json" \
  --data '{
      "email": "client@example.com",
      "password": "client123"
    }')
token=$( jq -r ".token" <<<"$json" )
echo "the extracted token: $token"
echo -e "\n"

echo "Getting the client dashboard infos"
curl -X GET http://localhost:3000/dashboard/client \
  -H "Authorization: Bearer $token"
echo -e "\n"
