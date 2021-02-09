# Users (or authentication) service: Documentation

## Description

The users microservice (or authentication microservice) has for goal to handle operations in order to register and authenticate the different users.

It is contained in the container `users-daemon` and is reachable at `${HOST_IP}:3009`

It communicates with the logger service to keep logs about the different operations processed as well as their performance.

It works in pair with its database `users-db`, a couchDB storage that contains the role and the encrypted password for each user.

The logger must be running and linked with this microservice in order for it to work correctly.

In the sections below, we will mention some databases:  
1. By the logs database, we mean the database in the container `logs-db` reachable at `${HOST_IP}:3002`
1. By the users database, we mean the database in the container `users-db` reachable at `${HOST_IP}:3000`

It handles two different requests:

1. Registering a new user: \
    A new user can be added to the users database by using this request. A `username`, `role` and `password` need to be provided. If the username does not exist yet in the database, the request will return with a 200 status as well as a token proving the authentication of the new user and containing his username, role and date of creation and expiration encrypted. Otherwise, a 409 error will be thrown.

1. Authentifying a user: \
    A user can authentify itself by providing his `username` and `password` in this request. If the `username` exists in the users database and the passwords match, a `token` as the one described in the previous request will be returned with a 200 status. If the `username` does not exist in the users database or if it exists but with a different `password`, a 404 error will be thrown.

## API

The interface of this microservice allows the 4 operations described above:

1. Registering a new user: 
    ```bash 
    POST /user ${data}
    ```
    ```${data}``` is a JSON object with at least the following fields:
    - ```username```: a string identifying the user to be created
    - ```role```: a string that can be either ```"admin"``` or ```"user"``` representing the role of the user to be created
    - ```password```: a string containing the password of the user to be created

1. Authentifying a user: 
    ```bash
    GET /user/:username/:password
    ```
    - ```username```: a string identifying the user
    - ```password```: a string containing the password of the user
    This returns a JSON object `payload` that has a field `role` representing the role of the user authenticated and a field `token` with its current authentication token.

## Examples

This section will give an example for each of the operations above. In these examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice.

1. Registering a new user:
    ```bash
    curl -X POST --data "username=user&role=user&password=user" ${HOST_IP}:3001/user
    ```
    This command creates a new user with username `"user"`, role `"user"` and password `"user"`. 

1. Authentifying a user:
    ```bash
    curl -X GET ${HOST_IP}:3001/user/admin/admin
    ```
    This command returns the authentication token of user "admin" with password "admin" if the user exists in the database and its password is "admin". It also returns its role.


## Tests

This microservice can be tested with ```curl``` in different use-cases. The case below was tested and worked, but you can verify it yourself.

```bash
curl -X POST --data "username=user&role=user&password=user" ${HOST_IP}:3001/user
```
This command creates a new user with username `"user"`, role `"user"` and password `"user"`. \
This can be checked in the users database: we will see a new document of key `"user"` (the username) and with the following content:
- role: `"user"`
- password: an encrypted value of the password 

On top of this, the we should get a similar response as the following:
```bash
{"status":"success","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYyNDc3NTIsImlhdCI6MTYwNTAzODE1Miwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.cxe8jy3So2vMIickY0oWgF7fiEAqzs2vOKmzEUT-xno"}
```

Using this token as well as the `"user"` username and role with the validation service should return a success (more details in the validation microservice documentation).

The user can then authenticate himself using the following command:
```bash
curl -X GET ${HOST_IP}:3001/user/user/user
```
This should return a similar output as:
```bash
{"status":"success","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYyNTEwMTIsImlhdCI6MTYwNTA0MTQxMiwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.QlWcO4U5F0sGEjBmGorlmFYTpUKyUx13xB3H1e1v0Cg"}
```
The returned token can also be used in the validation service with the user's information and return a success.

If we try to create a new user with the same username, we will get the following output:
```bash
{"status":"error","message":"User with this username already exists"}
```

If we try to authenticate our new user with the wrong password using:
```bash
curl -X GET ${HOST_IP}:3001/user/user/wrongpassword
```
We will get:
```bash
{"status":"error","message":"Error: Passwords (for user: user) do not match."}
```

Each of these steps should produce logs in the logs database. We should be able to access performance logs for all the different steps included in this process, as well as a log of all operations made here in the `register` and `login` documents as well as in the `user` document (as these operations were related to the "login" and "register" operations as well as the "user" user). More details in the logger microservice documentation.

## Changes made since the first deliverable
- We corrected the second example (we made a small mistake).
- When a user login, it now returns the role of the user, in addition to its token already returned. It is useful for the front-end because we can easily see if the user is an admin or not, which is needed to display the page to add/modify/... the products.