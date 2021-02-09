# Recommendation service: Documentation

## Description

The recommendation microservice has for goal to propose recommendations of products. We propose 3 types of recommendations, one principal and two bonus:
1. a user-personalised product recommendation
1. a similar products recommendation
1. a best-sellers recommendation

It is contained in the container `recommendation-daemon` and is reachable at `${HOST_IP}:3012`

It communicates with the validation service in order to verify that the user for whom we want the recommendation, in the case of a user-personalised product recommendation, is authenticated.
Note that it doesn't need to call the validation service for the similar products recommendations and for the best-sellers recomendations since there is no need to be authenticated to have this recommendations.

It is also in contact with the logger service to keep logs about the performances of the operations made. And it also talks to the catalog service to retrieve the products currently present in the catalog in order to check that the recommended products are still in the catalog and so to not propose a product that has been removed.

It works in pair with the database of the logger service, which is `logs-db` and reachable at `${HOST_IP}:3002`, since the recommendations are produced by using the logs contained in this database. We know that this is not how the database of a microservice is supposed to be used but we justified our choice in the general documentation in the **Technological choices** section (see [DOCUMENTATION.md](../../../../DOCUMENTATION.md)).

It is clear that these microservices working with the recommender service must be running and linked with this microservice in order for it to work correctly.

## Algorithm

### Mapreduce
We used two different mapreduce (which are views inserted in the database) in order to make our recommendations:
1. the `user-items` view: for the user-personalised product recommendations and for the similar products recommendations
2. the `best-products` view: for the best-sellers

Feel free to look at the code. We recommend you to look at it directly in the database (once the views have been inserted so after at least a recommendation of each type has been made) since the code is more pleasant to look at there.

#### user-items view
This view computes for each user the total quantity of each product he has added in his cart.

##### Map
The map function looks at the adds to the cart of each user.
For each document in logs-db, it looks if it is a cart operation and if the action made is an add. If this is the case, then it emits the following :
- key: the user
- value: 
    - max: the maximal product id contained in the list of the products he added to his cart
    - items: a list of JSONS containing the id and the quantity of the product, for each product in the list of the products he added to his cart 

##### Reduce
The reduce function does the following: for each user, it sums the total quantities for each product id. 
It returns a JSON containing the users as keys and the total quantity for each products they have added at least once to their cart as values. It also returns the maximal product id we encountered.

To be more clear, the output is similar to this: 
```bash
{max: 2, matrix: {"user1":{"0":quantity_of_0, "1":quantity_of_1}, }, "user2":{"2":quantity_of_2},...}
```

#### best-products view
This view simply computes the total quantity bought for each product. 

##### Map
The map function looks at the checkouts of the cart (since it means that the products have been bought). For each document in logs-db, it looks if it is a cart operation and if the action made is a checkout. If this is the case, then it emits for each product present in the list of products its id as key and its quantity as value.

##### Reduce
The reduce function sums the quantities for each id.
Its output is a JSON containing JSONs with the product id as key and the total quantity bought for this product as value. 

### User-personalised product recommendations

The user-personalised recommendations are basing themselves on the user-items view. From the result of this view, we can build a score matrix containing for each user and each item, the number of times that it was added to the cart of the user. Once this is computed, we apply a k-nearest-neighbors algorithm to predict the number of times the target user would add each item to his cart. This returns the list of items sorted from highest to lowest score, from which we remove the items that have already been added to the target user's cart, as it is required in the specifications. The function doing this computation is called `knn`

The prediction formula is the following:

![KNN](../../../../img/knn.png)

In our case, the similarity function used is the `cosine similarity` and is computed between the lines of our score matrix as such: 

![Cosine Similarity](../../../../img/Cosine%20Similarity.png)

The algorithm returns a list of items that are predicted to be the items that the target user would want to add the most to his cart. The items predicted for the target user are based on the items that the other users that are the most similar to the target user (based on the cosine similarity function) added to their cart.

These predictions can only be done if the target user has items in common with at least one other user in the score matrix (which means that they added at least one common item). This can be checked using the provided `hasCommonItems` function.

This algorithm is not that scalable yet as we are basing ourselves on all users and all items. However, if needed, we could improve the code to build the score matrix on a finite number of users chosen randomly. That way, no matter how many users are adding items to their cart, the performance will be the same, at the price of a loss in accuracy.


### Similar products recommendations

The items recommendation are more simple and do not respect the requirements given but we wanted to add them as a "bonus". Indeed, items that are already in the cart can be recommended. 

These recommendations are simply built on the cosine similarity function. Using the score matrix described above, we compute the similarity of all products with the target item and return a list of all items sorted from highest to lowest similarity with the target item, except the target item himself. The method implementing this is called `closestItems`.

These predictions can only be done if the target item has users in common with at least one other item in the score matrix (which means that they both have been added by at least one common user). This can be checked using the provided `hasCommonUsers` function.

### Best-sellers

The best-sellers recommendation is the simplest of them all. 
From the result of the best-products view, we simply need to return the product ids with the highest quantities, sorted from the most to the least sold.

## API
The interface of this microservice allows the 3 following operations:

1. Getting a user-personalised product recommendation
    ```bash
    GET /user/:username/:role/:token
    ```
    - ```${username}```: a string which is the name of the user for whom we want the recommendation (= the target user). It is the user who is currently authenticated.
    - ```${role}```: a string which is the role of the user (```user``` or ```admin```). This is necessary to make the authenticattion check (by the validation service).
    - ```${token}```: a string which is the authentication token of the user. Again, this is necessary to make the authentication check.

1. Getting a similar products recommendation
    ```bash
    GET /item/:id
    ```
    ```${id}```: a number which is the id of the product for which we want the recommendation (= the target item).

1. Getting a best-sellers recommendation
    ```bash
    GET /best
    ```

## Examples
This section will give an example for each of the operations above. In these examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice.

1. Getting a user-personalised product recommendation
    ```bash
    curl -X GET ${HOST_IP}:3012/user/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYxNjI0NjEsImlhdCI6MTYwNDk1Mjg2MSwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.nwbLgCZfAnuCLTFbFL8qMrppaqcuNppOld4sqphwKHM
    ```
    With this command, the user `"user"` with the role `"user"` can get the products recommended for him, as long as the token provided is valid.

1. Getting a similar products recommendation
    ```bash
    curl -X GET ${HOST_IP}:3012/item/0
    ```
    This command allows to get the products recommended for the product that has an `id` of `0`.

1. Getting a best-sellers recommendation
    ```bash
    curl -X GET ${HOST_IP}:3012/best
    ```
    This commands allows to get the most sold products.

## Tests
This microservice can be tested with ```curl``` in different use-cases. The case below was tested and worked, but you can verify it yourself. You have to use the commands described in the **Examples** section.

In order to have the same results, you need to have three users, `"admin"` with role `"admin"`, `"user1"` and `"user2"` who are simple users. You can do it by using the commands provided in [USERS.md](../users/USERS.md) or directly from the front-end if you want. Note that you have to make a curl for registering `"admin"`anyway (or to modify its role manually in the users database).

You have to add 3 products in the catalog with the `"admin"` user (since his role is `"admin"`). You can do it via curl by following the commands in [CATALOG.md](../catalog/CATALOG.md) or again, directly via the front-end. If you do it via curl, put the id 0, 1 and 2 to the products.

Then, the users have to add products to their carts:
- `"user1"` adds the product with id 0 with a quantity of 2 and the product with id 1 with a quatity of 1.
- `"user2"` adds the product with id 1 with a quantity of 1 and the product with id 2 with a quantity of 4.

Finally, `"user2"` has to buy the products in his cart so he needs to checkout his cart.

For the two last steps, you can look in [CART.md](../cart/CART.md) for the commands or you can do it from the front-end.

Now let's do the tests:

1. By using the first command with the authentication informations of `"user1"` (its role and token), we can get the recommended products for `"user1"`. The output is supposed to look like this:
    ```bash
    {"status":"success","output":[2]}
    ```
    This means that the recommended product for `"user1"` is the product with id 2. This is logical because `"user2"` has also added the product 1 to his cart and since he also added the product 2, this is recommended to `"user1"`. 
    Note that only the product 2 was returned, since the products 0 and 1 are still in his cart. So we respect well the specifications. 

1. By using the second command, we can get the products recommended for the product with the id 0. The output is supposed to look like this:
    ```bash
    {"status":"success","output":[1,2]}
    ```
    This means that the product to be most likely added to the cart when adding the product with id 0 is the product with id 1. This is logical because `"user1"` added the product 1 along with the product 0 to his cart. 


1. By using the third command, you can get the most sold items (= the best-sellers). The output is supposed to look like this:
    ```bash
    {"status":"success","output":[2,1]}
    ```
    This means that the product with id 2 is the most sold product (remember that we bought it with a quantity of 4) and the next one is the product with id 1, which is the only other product sold.

One last test that can be made is to check that a product is not recommended if it has been removed from the catalog. So let's remove the product with id 2 (by using `"admin"`). Now, the outputs should look like this:

1. For the first command:
    ```bash 
    {"status":"success","output":[]}
    ``` 
1. For the second command:
    ```bash 
    {"status":"success","output":[1]}
    ```

1. For the third command:
    ```bash 
    {"status":"success","output":[1]}
    ```
We see well that the poduct 2 is not recommended anymore since it doesn't exist now.

You can see all the results visually in the front-end (by making the experiments there). Also, you can have more information about the front-end part of the recommendation service in the front-end documentation (see [FRONT-END.md](../../front-end/FRONT-END.md)).