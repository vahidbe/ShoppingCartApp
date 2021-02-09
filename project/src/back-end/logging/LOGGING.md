# Logging service: Documentation

## Description

The logging microservice (also refered as logger) has for goal to keep a trace of all the operations performed by users in the other microservices as well as their performance.

It is contained in the container `logger-daemon` and is reachable at `${HOST_IP}:3004`

It works in pair with its database `logs-db`, a couchDB storage that contains all the logs that the logger takes.
 
1. By the logs database, we mean the database in the container `logs-db` reachable at `${HOST_IP}:3002`

It handles seven different operations:

1. Logging a login request: \
    The users (or authentification) service can log a successful login with this request. It simply needs to specify the `username` of the user concerned.

1. Logging a registration request: \
    The users (or authentification) service can log a successful registration with this request. It simply needs to specify the `username` of the user concerned.

1. Logging an order: \
    The orders service can log a successful order with this request. It simply needs to specify the `username` of the user concerned, as well as a list of JSON objects representing the `products` included in this order.

1. Logging a cart operation: \
    The cart service can log a successful cart operation with this request. It simply needs to specify the `username` of the user concerned, the `action` made as well as potentially a list of JSON objects representing the `products` that may have been part of this operation.

1. Logging a catalog operation: \
    The catalog service can log a succesful operation with this request. It is divided in two parts: one that concerns the modifications of the catalog (add/modify/delete) and one that concerns the gets in the catalog. The separation is because the first one needs a user (whose role is an admin) while the other one doesn't. The request simply needs to specify the `username` of the user concerned (it is the string `"none"` if it's a get operation), the `action` made, the `products` involved in the operation and the `queryType` indicating the type of the operation performed on the catalog.

1. Logging a performance log: \
    The different services can add a performance log linked to the request they processed with this request. To do so, they must provide the name of the `service`, the `username` of the user concerned in this request, his `role`, the `handling time` of the request and its `nature`. Note that in the case of the catalog service, since the get operations don't need a user to be authenticated, both `username` and `role` are set to the string `"none"`.
    
1. Retrieving the logs: \
    A user can retrieve all logs. If there is no logs in the database, a 404 error is thrown.

All these operations return a 200 status if no error is encountered. If this is not the case, a 500 error is thrown (except for the "Retrieving the logs" request that returns a 404 error).

## API

The interface of this microservice allows the 7 operations described above:

1. Logging a login request:
    ```bash 
    POST /log/login ${data}
    ```
    ```${data}``` is a JSON object with at least the following field:
    - ```user```: a string identifying the user (his username)

1. Logging a registration request: 
    ```bash 
    POST /log/register ${data}
    ```
    ```${data}``` is a JSON object with at least the following field:
    - ```user```: a string identifying the user (his username)

1. Logging an order: 
    ```bash 
    POST /log/order ${data}
    ```
    ```${data}``` is a JSON object with at least the following field:
    - ```user```: a string identifying the user (his username)
    - ```products```: a list of JSON objects containing the following fields describing the products in the order.

1. Logging a cart operation: 
    ```bash 
    POST /log/cart ${data}
    ```
    ```${data}``` is a JSON object with at least the following field:
    - ```user```: a string identifying the user (his username)
    - ```action```: a string describing the action done in the cart (can be `"add"`, `"remove"`, `"checkout"` or `"get"`)
    - ```products```: a list of JSON objects containing the following fields describing the products potentially involved in the cart operation.

1. Logging a catalog operation: 
    ```bash 
    POST /log/catalog ${data}
    ```
    ```${data}``` is a JSON object with at least the following field:
    - ```user```: a string identifying the user (his username)
    - ```action```: a string describing the action done in the catalog (can be `"add"`, `"modify"`, `"delete"`,`"get item"` or `"get all catalog"`)
    - ```products```: a list of JSON objects containing the following fields describing the products potentially involved in the catalog operation.
    - ```queryType```: a string to differentiate between the two parts (can be `"post"`, for a modification of the catalog, and `"get"` or `"item"` for the gets operation).

1. Logging a performance log: 
    ```bash 
    POST /log/performance ${data}
    ```
    ```${data}``` is a JSON object with at least the following field:
    - ```user```: a string identifying the user (his username)
    - ```service```: a string describing the service sending this performance log
    - ```nature```: a string describing the nature of the request handled by this microservice
    - ```handling_time```: the number of milliseconds that the service took to process its request 
    
1. Retrieving the logs: 
    ```bash 
    GET /log
    ```

## Examples

This section will give an example for each of the operations above. In these examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice.

1. Logging a login request:
    ```bash 
    curl -X POST --data "user=user" ${HOST_IP}:3004/log/login
    ```
    This command adds a log for a login request from the user with username `"user"`. This adds a document in the logger database.

1. Logging a registration request: 
    ```bash 
    curl -X POST --data "user=user" ${HOST_IP}:3004/log/register
    ```
    This command adds a log for a register request from the user with username `"user"`. This adds a document in the logger database.

1. Logging an order: 
    ```bash 
    curl --header "Content-Type: application/json" --request POST --data '{"user":"user", "products": [{"id" : 0, "name":"tomate", "quantity":1},{"id": 1, "name":"salade", "quantity":3}]}' ${HOST_IP}:3004/log/order
    ```
    This command adds a log for a new order with 1 `"tomate"` and 3 `"salade"` for user with username `"user"`. This adds a document in the logger database.

1. Logging a cart operation: 
    ```bash 
    curl --header "Content-Type: application/json" --request POST --data '{"user":"user", "action":"add", "products": [{"id" : 0, "name":"tomate", "quantity":1},{"id" : 1, "name":"salade", "quantity":3}]}' ${HOST_IP}:3004/log/cart
    ```
    This command adds a log for a new "adding products" operation in the cart for user with username `"user"`. It means that this user added 1 `"tomate"` and 3 `"salade"` to his cart. This adds a document in the logger database.
    This command can also be done with the `action` `"remove"`, `"checkout"` or `"get"`.

1. Logging a catalog operation: 
    - modifying the catalog
        ```bash 
        curl --header "Content-Type: application/json" --request POST --data '{"user":"admin", "action":"add", "products": {"id" : 0, "name":"tomate", "category":"Fruits"}, "queryType":"post"}' ${HOST_IP}:3004/log/catalog
        ```
        This command adds a log for a new "adding products" operation in the catalog for user with username `"user"`. It means that this user added the product with id `"0"` which is `"tomate"` to the catalog. This adds a document in the logger database.
        This command can also be done with the `action` `"modify"` and `"delete"`. For `"delete"`, the `"products"` field only contain a string representing the name of the product (ex: "products":"tomate").

    - getting an item or all of them:
        ```bash 
        curl --header "Content-Type: application/json" --request POST --data '{"user":"none", "action":"get item", "products": 0, "queryType":"item"}' ${HOST_IP}:3004/log/catalog
        ```
        This command adds a log for a new "get item" operation in the catalog. It means that the product with id `"0"` which is `"tomate"` was got/viewed from the catalog. This adds a document in the logger database.
        This command can also be done with the `action` `"get all catalog"`, which takes the `products` `"all the catalog"` and `queryType` `"get"`


1. Logging a performance log: 
    ```bash 
    curl --header "Content-Type: application/json" --request POST --data '{"user":"user", "role":"user", "service":"login", "nature":"login of a user", "handling_time":56}' ${HOST_IP}:3004/log/performance
    ```
    This command adds a new performance log from user `"user"` of role `"user"` and service `"login"` as well as the given nature and handling time.
    
1. Retrieving the logs: 
    ```bash 
    curl -X GET ${HOST_IP}:3004/log
    ```
    This command retrieves the logs.
    

## Tests

This microservice can be tested with ```curl``` for all operations mentionned before. If you try to execute a command from the previous section, you will notice that new documents in the logs database will be added and that the information that is to be logged will be correctly in these new documents.
You can also use any of the other commands from the other microservices and you will notice that the logs are correctly updated according to the requests performed and the microservices accessed.

## Changes made since the first deliverable
- In the code, we corrected the way the logs of the cart operations were added in the database because we needed some missing informations to be able to perform the map-reduce for the recommendations: we just added the field ```action``` to dinstinguish the type of operation. Now we see the difference between an ```add``` to the cart and a ```checkout``` of the cart. It was clear in the message but there was no field telling it.

- We also added the ```products``` field in the logs of the orders to be more logical.

- We changed the way the logs are added and so how they are retrieved: we just added everything in the logs without a specific key. Like this, it is more scalable because it is added faster. Also, since we don't need to specify the key when getting the logs, we retrieve all the logs in order and so it is easier to follow the chronology of the events, which is useful in case of a crash.