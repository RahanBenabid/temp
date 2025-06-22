#!/bin/bash

API_URL="http://localhost:3000/products"   # Update if your API path is different
LOGIN_URL="http://localhost:3000/users/login"  # Update if your login path is different

SUPPLIER_EMAIL="supplier@gmail.com"
SUPPLIER_PASSWORD="supplier123"

# 1. Login to get supplier token
echo "Logging in as supplier..."
LOGIN_RESP=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "email": "'"$SUPPLIER_EMAIL"'",
  "password": "'"$SUPPLIER_PASSWORD"'"
}' $LOGIN_URL)

TOKEN=$(echo $LOGIN_RESP | jq -r '.token')
SUPPLIER_ID=$(echo $LOGIN_RESP | jq -r '.user.id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token. Login response:"
  echo "$LOGIN_RESP"
  exit 1
fi

echo "Token received: $TOKEN"

# 2. Create a product
echo "Creating product..."
CREATE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
  "name": "Shell Test Product",
  "description": "Added by shell test",
  "price": 10.50,
  "category": "Shell",
  "isAvailable": true,
  "supplierProfileId": "'"$SUPPLIER_ID"'",
  "imageUrl": "",
  "type": "light",
  "stock": 99
}' $API_URL)

echo "Create Response: $CREATE_RESPONSE"

PRODUCT_ID=$(echo $CREATE_RESPONSE | jq -r '.id')

# 3. Get all products
echo "Fetching all products..."
curl -s -H "Authorization: Bearer $TOKEN" $API_URL | jq .

# 4. Get the created product by ID
echo "Fetching created product..."
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/$PRODUCT_ID | jq .

# 5. Update the product
echo "Updating product..."
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
  "name": "Shell Test Product Updated",
  "price": 15.00
}' $API_URL/$PRODUCT_ID | jq .

# 6. Delete the product
echo "Deleting product..."
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" $API_URL/$PRODUCT_ID

# 7. Confirm deletion
echo "Confirm deletion (should not find product):"
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/$PRODUCT_ID | jq .
