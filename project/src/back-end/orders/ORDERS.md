# Orders service: Documentation

## Description

The orders microservice has for goal to enable users to stock and access their orders. This means that a user can access his past orders from different devices.

It is contained in the container `orders-daemon` and is reachable at `${HOST_IP}:3007`

It communicates with the validation service in order to verify that the user is authentificated and to verify his role. It is also in contact with the logger service to keep logs about the different operations processed as well as the performance.

It works in pair with its database `orders-db`, a couchDB storage that contains the orders for each user.

It is clear that these microservices working with the order service must be running and linked with this microservice in order for it to work correctly.

In the sections below, we will mention some databases: 
1. By the orders database, we mean the database in the container `orders-db` reachable at `${HOST_IP}:3006`. 
1. By the logs database, we mean the database in the container `logs-db` reachable at `${HOST_IP}:3002`

It handles two different operations:

1. Adding an order: \
    The user can add an order containing products. The products must be JSON objects containing at least an ```id``` field identifying them. This order is added to the existing orders of this user.\
    This operation is called from the `cart` microservice when checking out. More information in the documentation of the `cart` microservice.

1. Retrieving the orders: \
    The user can retrieve his past orders. If this user does not have any orders, a empty list is returned, meaning that there are no orders.

All these operations required the user to be authentificated and to provide his role as well as a valid token matching his username and role. If this condition is not respected, a 401 error is thrown.

## API

The interface of this microservice allows the 4 operations described above:

1. Adding an order: 
    ```bash 
    POST /order ${data}
    ```
    ```${data}``` is a JSON object with at least the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user
    - ```products```: a list of JSON objects containing at least the following field: 
        - ```id```: a number identifying the product that needs to be added to the order

1. Retrieving the orders: 
    ```bash
    GET /order/:username/:role/:token
    ```
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user

## Examples

This section will give an example for each of the operations above. In these examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice.

1. Adding an order:
    ```bash
    curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI1OTksImlhdCI6MTYwNDg1Mjk5OSwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.MrxkPs2OMD4mhStY5AKJCuO_2sBBlPE_WiBp4xYoINA", "products": [{"id":0, "name":"carotte", "quantity":2},{"id":1, "name":"tomate", "quantity":1}]}' ${HOST_IP}:3007/order
    ```
    This command adds a new order with 2 `"carotte"` (identified by the id `0`) and 1 `"tomate"` (identified by the id `1`) to the orders of user `"user"` (that has role `"user"`) as long as the provided token is valid.

1. Retrieving the orders:
    ```bash
    curl -X GET ${HOST_IP}:3007/order/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI3NzAsImlhdCI6MTYwNDg1MzE3MCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.CNJhSQWcwXojNufgld_8t6C5BM4__Lwaox2B0Ky8VVo
    ```
    This command returns the orders of user `"user"` (that has role `"user"`) as long as the provided token is valid.
    

## Tests

This microservice can be tested with ```curl``` in different use-cases. The case below was tested and worked, but you can verify it yourself.

A user can first add an order using:
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI1OTksImlhdCI6MTYwNDg1Mjk5OSwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.MrxkPs2OMD4mhStY5AKJCuO_2sBBlPE_WiBp4xYoINA", "products": [{"id":0, "name":"carotte", "quantity":2},{"id":1, "name":"tomate", "quantity":1}]}' ${HOST_IP}:3007/order
```
As this is the first order that this user has done, we can verify that the orders database contains a document with key `user` containing this order.

The user can add another order with:
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI1OTksImlhdCI6MTYwNDg1Mjk5OSwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.MrxkPs2OMD4mhStY5AKJCuO_2sBBlPE_WiBp4xYoINA", "products": [{"id":1, "name":"tomate", "quantity":1},{"id":2, "name":"salade", "quantity":3}]}' ${HOST_IP}:3007/order
```
We will then see in the orders database, the new updated document should contain 2 orders, the one created before and a new one containing 1 `"tomate"` and 3 `"salade"`.

The user can then retrieve its orders with:
```bash
curl -X GET ${HOST_IP}:3007/order/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI3NzAsImlhdCI6MTYwNDg1MzE3MCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.CNJhSQWcwXojNufgld_8t6C5BM4__Lwaox2B0Ky8VVo
```
We should a result similar to this:
```bash
{"status":"success","orders":[{"time":"2020-11-09T21:13:49+00:00","products":[{"id":0,"name":"carotte","quantity":2},{"id":1,"name":"tomate","quantity":1}]},{"time":"2020-11-09T21:14:11+00:00","products":[{"id":1,"name":"tomate","quantity":1},{"id":2,"name":"salade","quantity":3}]}]}
```

Each of these steps should produce logs in the logs database. We should be able to access performance logs for all the different steps included in this process, as well as a log of all 6 operations made here in the `cart` document as well as in the `user` document (as these operations were related to the "cart" microservice and the "user" user). More details in the logger microservice documentation.

## Changes made since the first deliverable
- The operations are done with the ```id``` of the products and not with their ```name``` anymore since the products are now indentified by an id and not by their name (as mentionned in the documentation of the catalog). 
We changed the API and the examples in consequence.

- In order to make the link with the front-end more easily, we modified the fact that if we are not able to get the orders (because there is none so there is nothing to retrieve), instead of sending an error, we return the success status and an empty list indicating that the orders are empty.