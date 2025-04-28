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

cd ../
npx sequelize db:seed:all

# USER TEST ------------------------------------------------

echo -e "${YELLOW}USER TEST${RESET}"

echo "Creating a user instance"
response=$(curl -s -X POST http://localhost:3000/users \
	--header "Content-Type: application/json" \
	--data '{
		"firstname": "benabid",
		"lastname": "rahan",
		"phone": "0542008183",
		"email": "nadimerahan@gmail.com",
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
			"email": "nadimerahan@gmail.com",
			"password": "0000"
		}')
token=$( jq -r ".token" <<<"$json" )
echo "the returned json: $json"
echo -e "\n"

# PROTECTED ROUTES

echo "Getting all users"
curl -X GET http://localhost:3000/users --header "Authorization: Bearer $token"
echo -e "\n"

echo "Getting the user with the id $user_id"
curl -X GET http://localhost:3000/users/$user_id --header "Authorization: Bearer $token"
echo -e "\n"

echo "Updating the user with the id $user_id"
curl -X PUT http://localhost:3000/users/$user_id \
	--header "Authorization: Bearer $token" \
	--header "Content-Type: application/json" \
	--data '{
		"firstname": "john",
		"lastname": "donald",
		"phone": "0542099993",
		"email": "rahannadime@gmail.com"
	}'
echo -e "\n"

# CLIENT ORDER TEST ------------------------------------------------

echo -e "${YELLOW}ORDER TEST${RESET}"

echo "Creating a client order instance"
response=$(curl -s -X POST http://localhost:3000/clientOrders \
	--header "Authorization: Bearer $token" \
	--header "Content-Type: application/json" \
	--data '{
		"artisanId": "9b5bb690-6339-4ef9-acb9-91010431b96a",
		"description": "I need to see this",
		"totalAmount": "19"
	}')
echo -e
echo $response
order_id=$(echo $response | jq -r '.order.id')
echo -e "\n"

echo "Getting all client orders"
curl -X GET http://localhost:3000/clientOrders --header "Authorization: Bearer $token"
echo -e "\n"

echo "Getting the client order with the id $order_id"
curl -X GET http://localhost:3000/clientOrders/$order_id --header "Authorization: Bearer $token"
echo -e "\n"

echo "Updating the client order with the id $order_id"
curl -X PUT http://localhost:3000/clientOrders/$order_id \
	--header "Authorization: Bearer $token" \
	--header "Content-Type: application/json" \
	--data '{
			"description": "this should be updated... i hope",
			"totalAmount": "44"
		}'
echo -e "\n"

# ARTISAN ORDER TEST ------------------------------------------------

echo -e "${YELLOW}ORDER TEST${RESET}"

echo "Logging in as an artisan..."
response=$(curl -s -X POST http://localhost:3000/users/login \
	-H "Content-Type: application/json" \
	-d '{
		"email": "artisan@example.com",
		"password": "artisan123"
	}')
artisanToken=$(echo "$response" | jq -r .token)
if [[ -n artisanToken ]]; then
	echo "Successfully logged in as an artisan!"
fi
echo -e "\n"

echo "Creating an artisan order instance..."
response=$(curl -s -X POST http://localhost:3000/artisanOrders \
-H "Authorization: Bearer $artisanToken" \
-H "Content-Type: application/json" \
-d '{
		"supplierId": "9b5bb690-6339-444a-2222-91010431b96a",
		"deliveryManId": "9b5bb690-6339-4ef9-2222-91010431b96a",
		"materialDetails": {
			"type": "wood",
			"quantity": 10,
			"unit": "kg"
		},
		"deliveryAddress": "500"
	}')
echo $response
artisanOrderId=$(echo "$response" | jq -r .order.id)
echo -e "\n"

echo "Getting the artisan order with the id $artisanOrderId"
curl -X GET http://localhost:3000/artisanOrders/$artisanOrderId --header "Authorization: Bearer $artisanToken"
echo -e "\n"

echo "Updating the artisan order with the id $artisanOrderId"
curl -X PUT http://localhost:3000/artisanOrders/$artisanOrderId \
--header "Authorization: Bearer $artisanToken" \
--header "Content-Type: application/json" \
--data '{
		"materialDetails": {
			"type": "cement",
			"quantitos": 5000,
			"unitos": "g"
		},
		"deliveryAddress": "les 1000"
	}'
echo -e "\n"

# DELETION -------------------------------------------------------------

#echo -e "${YELLOW}DELETION${RESET}"
#
#echo "Deleting the client order with the id $order_id"
#response_code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:3000/clientOrders/$order_id --header "Authorization: Bearer $token")
#echo -e "Response Code: ${YELLOW}$response_code${RESET}"
#echo -e "\n"
#
#echo "Deleting the artisan order with the id $artisanOrderId"
#response_code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:3000/artisanOrders/$artisanOrderId --header "Authorization: Bearer $artisanToken")
#echo -e "Response Code: ${YELLOW}$response_code${RESET}"
#echo -e "\n"
#
#echo "Deleting the user with the id $user_id"
#response_code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:3000/users/$user_id --header "Authorization: Bearer $token")
#echo -e "Response Code: ${YELLOW}$response_code${RESET}"
#echo -e "\n"
