# Database Conception

## USER Model

### Recommended Approach

- the system has distinct roles with different behaviors (ex… artisans order from suppliers, clients don’t).
- this will need role-specific data (artisan skills, supplier inventory) that doesn’t apply to all users.
- A single User model for authentication keeps login/logout simple, while profile tables handle role-specific logic.
- Sequelize handles associations (belongsTo, hasOne) well, making this approach practical.
- This way a single User model will handle the _authentication_ details for identification for all the roles…
- The other models will store the _role-specific data_ linked to that role, this way it could be more scalable too… any type of user is being added later on

### MODELS

`User` table:

- id INT Primary key, auto-increment
- email VARCHAR Unique email for login
- password VARCHAR Hashed password
- role ENUM Options: "client", "artisan", "supplier", "delivery_man"
- created_at DATETIME Timestamp

`‌ClientProfile` table:

- Field Type Description
- id INT Primary key, auto-increment
- user_id INT Foreign key to User
- name VARCHAR Client’s name
- address TEXT Delivery/service address

`ArtisanProfile` table:

- id INT Primary key, auto-increment
- user_id INT Foreign key to User
- name VARCHAR Artisan’s name
- skills JSON/TEXT List of skills (e.g., plumbing)

`SupplierProfile` table:

- id INT Primary key, auto-increment
- user_id INT Foreign key to User
- name `VARCHAR` Supplier’s name
- inventory JSON/TEXT Available items

`DeliveryManProfile` table:

- id INT Primary key, auto-increment
- user_id INT Foreign key to User
- name VARCHAR Delivery person’s name
- vehicle VARCHAR Vehicle type (e.g., bike)

Authentication can later be implemented easily.

# TODO:

- [ ] Ensure role-specific rules (only artisans can order from suppliers) in the business logic.
- [ ] use Jest to test the API
- [x] the `exclude` function is not working somehow...
- [x] authentication using jwt
- [x] relationships between the models
- [ ] should make the other models clearer about the realtionships tho
- [ ] include the related model in the GET requests...
- [ ] should implement the password reset
- [ ] user should be able to login using the email or the phone number
- [x] should use the user buildt in compare function in the login in UserController
- [ ] could add pagination in the `getAllUsers`
- [ ] add caching logic when all is done
- [ ] endpoint to be able to cancel the order or change the status
- [ ] should implement the address logic, preferably in a handler
- [ ] be more verbose about the relationships in the models...
- [ ] need to enforce later on the JSON sent by the artisan
- [ ] total amount implementation

For security

- [ ] IP checking, token blacklisting, or short expiry + refresh tokens
