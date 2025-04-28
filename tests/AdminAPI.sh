#!/usr/bin/env bash

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'

# ------

# Function to check if the server is running
check_server() {
	local host=$1
	local port=$2
	
	# Using netcat to see if the port is open
	nc -z "$host" "$port" > /dev/null 2>&1
	if [[ $? -ne 0 ]]; then
		echo "Error: Server is not running on $host:$port. Exiting."
		exit 1
	fi
}

SERVER="localhost"
PORT="3000"

echo "Checking if the server is running on $SERVER:$PORT..."
check_server "$SERVER" "$PORT"
echo "Server is running. Proceeding with the tests."
echo -e "\n"

# SEED THE DATABASE -------------------------------------

#cd ../
#npx sequelize db:seed:all

# ADMIN TEST -----------------------------------------------

echo "Logging in as an Admin"
response=$(curl -s -X POST http://localhost:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{
		"email": "admin@example.com",
		"password": "admin123"
	}')

echo $response
token=$(echo $response | jq  -r '.token')
echo -e "\n"

echo "creating a delivery man model as an admin"
curl -X POST http://localhost:3000/users \
	-H "Authorization: Bearer $token" \
	-H "Content-Type: application/json" \
	-d '{
		"firstname": "benabid",
		"lastname": "rahan",
		"phone": "0542008183",
		"email": "nadimerahan@gmail.com",
		"password": "0000",
		"role": "DELIVERY_MAN",
		"nationalCardNumber": "05964275867113459678",
		"vehicle": "CAR"
	}'
echo -e "\n"
		
echo "Creating an artisan as an admin"
curl -X POST http://localhost:3000/users \
-H "Authorization: Bearer $token" \
-H "Content-Type: application/json" \
		-d '{
		"firstname": "Ali",
		"lastname": "Hassan",
		"phone": "0551234567",
		"email": "ali.hassan@example.com",
		"password": "artisan123",
		"role": "ARTISAN",
		"profession": "Carpenter"
	}'
echo -e "\n"
		
echo "Creating a supplier as an admin"
curl -X POST http://localhost:3000/users \
-H "Authorization: Bearer $token" \
-H "Content-Type: application/json" \
-d '{
		"firstname": "Sara",
		"lastname": "Youssef",
		"phone": "0567890123",
		"email": "sara.youssef@example.com",
		"password": "supplier456",
		"role": "SUPPLIER",
		"shopName": "Sara Supplies",
		"shopAddress": "123 Market Street",
		"inventory": "Wood, Nails, Tools"
	}'
echo -e "\n"

echo "Changing a ClientOrder status using a hardcoded id..."
clientOrder_id="de7e93bc-f87f-48a1-9faa-e5a4b7bd25da"

curl -X PUT http://localhost:3000/clientOrders/$clientOrder_id/status \
	-H "Authorization: Bearer $token" \
	-H "Content-Type: application/json" \
	-d '{
		"status": "ACCEPTED"
	}'
echo -e "\n"

echo "Changing a ArtisanOrder status using a hardcoded id..."
artisanOrder_id="36eb6cd5-eece-499a-9912-da3a5170a64f"

curl -X PUT http://localhost:3000/artisanOrders/$artisanOrder_id/status \
-H "Authorization: Bearer $token" \
-H "Content-Type: application/json" \
-d '{
		"status": "SHIPPED"
	}'
echo -e "\n"