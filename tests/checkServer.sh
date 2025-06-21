#!/usr/bin/env bash

set -euo pipefail

set -euo pipefail

export GREEN='\033[0;32m'
export YELLOW='\033[0;33m'
export RESET='\033[0m'

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

result=$(mysql -u root -sN -e "use startup; select id from users where firstname='Admin'")

if [[ -z "$result" ]]; then
	cd ../
	npx sequelize db:seed:all
else
	echo "database already seeded, proceeding with tests"
fi

