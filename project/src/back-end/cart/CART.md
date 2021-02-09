# Cart service: Documentation

## Description

The cart microservice has for goal to handle operations in order to stock the cart of each user in the cloud. This means that a user can access his cart from different devices.

It is contained in the container `cart-daemon` and is reachable at `${HOST_IP}:3009`

It communicates with the validation service in order to verify that the user is authentificated and to verify his role. It is also in contact with the orders service to handle the checkout of the cart and with the logger service to keep logs about the different operations processed as well as the performance.

It works in pair with its database `cart-db`, a couchDB storage that contains the cart for each user.

It is clear that these microservices working with the cart must be running and linked with this microservice in order for it to work correctly.

In the sections below, we will mention some databases: 
1. By the cart database, we mean the database in the container `cart-db` reachable at `${HOST_IP}:3008`. 
1. By the orders database, we mean the database in the container `orders-db` reachable at `${HOST_IP}:3006`. 
1. By the logs database, we mean the database in the container `logs-db` reachable at `${HOST_IP}:3002`

It handles four different operations:

1. Adding products: \
    The user can add products with a specified quantity to his cart. If the cart does not exist yet, it is created. The products must be JSON objects containing a ```quantity``` field as well as a ```name``` field identifying them. These products are added to the existing products in the cart. If a product with the same identifying ```name``` exists in the cart, its quantity is simply increased.

1. Removing products: \
    The user can remove products with a specified quantity from his cart. If the cart does not exist, a 404 error is thrown. The products must be JSON objects containing a ```quantity``` field as well as a ```name``` field identifying them. These products are removed from the existing products in the cart. If the remaining quantity of a product is 0 or less, than this product is removed from the cart. If a product with the same identifying ```name``` does not exist in the cart, this product to remove is ignored.

1. Checking out: \
    The user can check out its cart. The products in the cart will be added in a new order for this user and the cart will be emptied. It uses the orders service to place the order. If the cart does not exist for this user, a 404 error is thrown.

1. Retrieving the cart: \
    The user can retrieve the content of his cart. If the cart does not exist for this user, an empty list (representing an empty cart) is returned.

All these operations required the user to be authentificated and to provide his role as well as a valid token matching his username and role. If this condition is not respected, a 401 error is thrown.

## API

The interface of this microservice allows the 4 operations described above:

1. Adding products: 
    ```bash 
    POST /cart/add ${data}
    ```
    ```${data}``` is a JSON object with at least the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user
    - ```products```: a list of JSON objects containing the following fields: 
        - ```id```: a number which is the id identifying the product that needs to be added to the cart
        - ```quantity```: an integer specifying the number of times this product must be added to the cart

1. Removing products: 
    ```bash
    POST /cart/remove ${data}
    ```
    ```${data}``` is a JSON object with at least the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user
    - ```products```: a list of JSON objects containing the following fields: 
        - ```id```: a number which is the id identifying the product that needs to be removed from the cart
        - ```quantity```: an integer specifying the number of times this product must be removed from the cart

1. Checking out: 
    ```bash
    POST /cart/checkout ${data}
    ```
    ```${data}``` is a JSON object with at least the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user

1. Retrieving the cart: 
    ```bash
    GET /cart/:username/:role/:token
    ```
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user

## Examples

This section will give an example for each of the operations above. In these examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice. Suppose that a `"carrotte"` is identified by the id `0`, a `"tomate"` has an id `1` and a `"salade"` an id `2`.

1. Adding products:
    ```bash
    curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno", "products": [{"id":0, "quantity":2},{"id":1, "quantity":1},{"id":2, "quantity":3}]}' ${HOST_IP}:3009/cart/add
    ```
    This command adds 2 `"carotte"`, 1 `"tomate"` and 3 `"salade"` to the cart of user `"user"` (that has role `"user"`) as long as the provided token is valid.

1. Removing products:
    ```bash
    curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno", "products": [{"id":0, "quantity":2},{"id":1, "quantity":2}]}' ${HOST_IP}:3009/cart/remove
    ```
    This command removes 2 `"carotte"` and 2 `"tomate"` from the cart of user `"user"` (that has role `"user"`) as long as the provided token is valid.

1. Checking out:
    ```bash
    curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno" }' ${HOST_IP}:3009/cart/checkout
    ```
    This command checks out the content of the cart of user `"user"` (that has role `"user"`) as long as the provided token is valid. The products in the cart are placed in a new order and the cart is emptied.

1. Retrieving the cart:
    ```bash
    curl -X GET ${HOST_IP}:3009/cart/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYxNjI0NjEsImlhdCI6MTYwNDk1Mjg2MSwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.nwbLgCZfAnuCLTFbFL8qMrppaqcuNppOld4sqphwKHM
    ```
    This command returns the content of the cart of user `"user"` (that has role `"user"`) as long as the provided token is valid.
    

## Tests

This microservice can be tested with ```curl``` in different use-cases. The case below was tested and worked, but you can verify it yourself.

Suppose that a `"carrotte"` is identified by the id `0`, a `"tomate"` has an id `1`, a `"salade"` an id `2`, a `"brocoli"` an id `3` and a `"cerise"` an id `4`.

A user can first add products to its cart using:
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno", "products": [{"id":0, "quantity":2},{"id":1, "quantity":1},{"id":2, "quantity":3}]}' ${HOST_IP}:3009/cart/add
```
As these are the first products added to its cart, we can verify that the cart database contains a document with key `user` containing the product list above.

The user can add some other products with:
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno", "products": [{"id":3, "quantity":2},{"id":1, "quantity":1}]}' ${HOST_IP}:3009/cart/add
```
We will then see in the cart database, the new updated document should contain 2 `"carotte"`, 2 `"tomate"`, 2 `"brocoli"` and 3 `"salade"`.

He can then remove some products with:
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno", "products": [{"id":0, "quantity":1},{"id":4, "quantity":2}, {"id":1, "quantity":3}]}' ${HOST_IP}:3009/cart/remove
```

We should then see 1 `"carotte"`, 2 `"brocoli"` and 3 `"salad"` in his cart. Notice that as the cart did not contain any `"cerise"`, it was ignored and `"tomate"` was removed from the cart as more items were removed than there were before the operation.

The user can then retrieve its cart with:
```bash
curl -X GET ${HOST_IP}:3009/cart/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYxNjI0NjEsImlhdCI6MTYwNDk1Mjg2MSwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.nwbLgCZfAnuCLTFbFL8qMrppaqcuNppOld4sqphwKHM
```
We should get the following result:
```bash
{"status":"success","cart":[{"id":0,"quantity":1},{"id":2,"quantity":3},{"id":3,"quantity":2}]}
```

The user can finally check out with:
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"user", "role":"user", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI5NzQsImlhdCI6MTYwNDg1MzM3NCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.mV2zS1zFybQl_WJVkmuQLfyRzYuv3RYaoW5t_pEBOno" }' ${HOST_IP}:3009/cart/checkout
```
We can then notice that the cart is empty in the cart database, but that a new order with the products mentionned earlier has been created in the order database with key `user`

If the user retrieves his cart at this point, he should get the following output (an empty cart):
```bash
{"status":"success","cart":[]}
```

Each of these steps should produce logs in the logs database. We should be able to access performance logs for all the different steps included in this process, as well as a log of all 6 operations made here in the `cart` document as well as in the `user` document (as these operations were related to the "cart" microservice and the "user" user). More details in the logger microservice documentation.

## Changes made since the first deliverable

- The operations are done with the ```id``` of the products and not with their ```name``` anymore since the products are now indentified by an id and not by their name (as mentionned in the documentation of the catalog). 
We changed the API and the examples in consequence.

- In order to make the link with the front-end more easily, we modified the fact that if we are not able to get the cart (because it is empty so there is nothing to retrieve), instead of sending an error, we return the success status and an empty list indicating that the cart is empty.

- Now when we send a log of a ```checkout``` and a ```get```, we also send the products concerned by these operation, instead of just putting ```null```. This is useful for the recommendation tool.