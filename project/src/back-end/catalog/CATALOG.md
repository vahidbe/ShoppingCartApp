# Catalog service: Documentation

## Description

The catalog microservice has for goal to handle the operations in order to add, modify, delete or get the different products in the catalog. This is where all the products of the application are stored and managed.

It is contained in the container `catalog-daemon` and is reachable at `${HOST_IP}:3011`

It communicates with the validation service in order to verify that the user is authenticated and to verify his role. More precisely, in the case of a modification of the catalog (add, modify or delete), it needs to check if the role of the user is an admin, since only an admin is allowed to do these operations. 
On the contrary, it doesn't need to call the validation service for a get (get one or all the products) since there is no need to be authenticated to do this actions.
It is also in contact with the logger service to keep logs about the different operations processed as well as their performance.

It works in pair with its database `catalog-db`, a couchDB storage that contains all the products of the catalog.

It is clear that these microservices working with the catalog must be running and linked with this microservice in order for it to work correctly.

In the sections below, we will mention some databases: 
1. By the catalog database, we mean the database in the container `catalog-db` reachable at `${HOST_IP}:3010`.
1. By the logs database, we mean the database in the container `logs-db` reachable at `${HOST_IP}:3002`.

It handles five different operations:

1. Adding a product: \
    The user can add a product to the catalog. The product must be a JSON object containing at least an ```id``` field, identifying it (it must be unique !), a ```name``` field, representing it, a ```category``` field specifying its category, an ```image``` field, containing the URL of the image we want to give to the product, and a ```price``` field with the price of the product. Other fields can also be added.

1. Modifying a product: \
    The user can modify a product in the catalog by updating the fields (or adding new ones) to an already existing product in the catalog. The product must be a JSON object containing at least an ```id``` field, identifying the product to modify. The other fields are the different fields the user wants to modify or add to the product (ex : ```name```, ```category```, ```price```, ..).

1. Deleting a product: \
    The user can delete a product from the catalog. The product is simply a number which is the ```id``` of the product to remove.

1. Getting a product: \
    A product of the catalog can be retrieved/viewed. It is retrieved by its ```id``` (= a number). The result is a JSON object containing the different fields of the product.

1. Getting all the products: \
    The whole catalog can be retrieved. The output is a JSON object with the different categories present in the catalog as fields, each one containing a JSON of the products belonging to them, with their ids as keys and the products as values. In other words, we retrieve the products sorted by categories.

The first three operations require the user to be authenticated, to have an ```admin``` role and to provide a valid token. If this condition is not respected, a 401 error is thrown.

## Azure Blob Storage
### Creation of the Azure Blob Storage blob container
The blob container is created in the code, in the file ./src/app.js.
It is done like this: 
```javascript
    var azure = require('azure-storage')
    var blobService = azure.createBlobService()

    blobService.createContainerIfNotExists('productimages', {
        publicAccessLevel: 'blob'
    }, function(error, result, response) {
        if (!error) {
            log("The blob container was successfully created")
        }
        else {
            log("could not create the blob container")
        }
    })
```
*azure-storage* is installed when building the docker container since we did `RUN npm install azure-storage` in the Dockerfile.

The function used are therefore : 
- ```createBlobService``` whose documentation can be found here: https://azure.github.io/azure-storage-node/global.html. 
The ```AZURE_STORAGE_ACCOUNT``` and ```AZURE_STORAGE_ACCESS_KEY``` are environment variables defined in the Dockerfile.
- ```createContainerIfNotExists``` whose documentation can be found here: https://azure.github.io/azure-storage-node/BlobService.html.

The name of the blob container is ```productimages```.


### Uploading an image on Azure Blob Storage

In order to upload an image on Azure Blob Storage, open a terminal and follow these steps :

1. Log to azure: 
    ```bash 
    az login
    ```
1. Create a variable containing the access key of the Blob storage:
    ```bash 
    KEY=L5uuMrU7Fdok+S/gY/COLov5HPWx7O0WSN2/yvxt9MKSY37sGxaImGHDT9v61NNFmc6WRgMQuv6M8FczsPEjyw==
    ```
1. Upload the image on the storage:
    ```bash 
    az storage blob upload --account-name soukeina --account-key ${KEY} --container-name productimages --file <pathToFile> --name <name>
    ```
    where `<pathToFile>` is the path of the image and `<name>` is the name you want to give to the image in the storage.

**Remark:** `<name>` is the same as the name we put in the ```image``` field when adding/modifying a product in the catalog.

Here is a small example : suppose we are in the the same directory as the image `banana.jpg` and we want to call it `banana` in the storage, we simply do 
```bash 
    az storage blob upload --account-name soukeina --account-key ${KEY} --container-name productimages --file banana.jpg --name banana
```
### Retrieving the URL of an image on Azure Blob Storage
In the first deliverable, the URL of an image was retrieved inside the code by using a function to do it and so we just needed to give the name of the image in the curl request. 
But now, since we have to enter the URL in the dedicated field in the front-end, we changed the way it worked. 
We removed the function inside the code and we will now provide you a way to get an image URL using the Azure CLI. 

This can be done by following these steps. **Note:** If you just added an image, the two first steps are unnecessary :

1. Log to azure: 
    ```bash 
    az login
    ```
1. Create a variable containing the access key of the Blob storage:
    ```bash 
    KEY=L5uuMrU7Fdok+S/gY/COLov5HPWx7O0WSN2/yvxt9MKSY37sGxaImGHDT9v61NNFmc6WRgMQuv6M8FczsPEjyw==
    ```
1. Retrieve the URL of the image on the storage:
    ```bash 
    az storage blob url --account-name soukeina --account-key ${KEY} --container-name productimages --name <name>
    ```
    where `<name>` is the name of the image you want to retrieve in the storage. It is the same name you put when uploading the image.

Here is a small example: suppose you just uploaded the banana image on the storage. To rertieve the URL, you just need to do the third step : 
```bash 
    az storage blob url --account-name soukeina --account-key ${KEY} --container-name productimages --name banana
```

And you should get the following URL:  https://soukeina.blob.core.windows.net/productimages/banana

**Note to make the task easier:** this URL will always be in the format `https://soukeina.blob.core.windows.net/productimages/<image name>`.



## API

The interface of this microservice allows the 5 operations described above:

1. Adding a product:
    ```bash 
    POST /catalog ${data}
    ```
    ```${data}``` is a JSON object with the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"``` representing the role of the user
    - ```token```: a string containing the authentication token of this user
    - ```action```: a string ```"add"``` telling that we are adding a product
    - ```products```: a JSON object containing the following fields: 
        - ```id```: a number identifying the product to add in the catalog (it is unique)
        - ```name```: a string representing the name of the product to add in the catalog
        - ```category```: a string specifying the category of the product to add
        - ```image```: a string which is the URL of the image on the Azure Blob Storage
        - ```price```: a number indicating the price
        - other fields giving informations about the product
    
1. Modifying a product:
    ```bash 
    POST /catalog ${data}
    ```
    ```${data}``` is a JSON object with the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"``` representing the role of the user
    - ```token```: a string containing the authentication token of this user
    - ```action```: a string ```"modify"``` telling that we are modifying a product
    - ```products```: a JSON object containing the following fields: 
        - ```id```: a number identifying the product to modify in the catalog
        - other fields we want to modify or add (ex: ```name```, ```category```, ```price```, ...)

1. Deleting a product:
    ```bash 
    POST /catalog ${data}
    ```
    ```${data}``` is a JSON object with the following fields:
    - ```username```: a string identifying the user
    - ```role```: a string that can be either ```"admin"``` or ```"user"``` representing the role of the user
    - ```token```: a string containing the authentication token of this user
    - ```action```: a string ```"delete"``` telling that we are removing a product
    - ```products```: a number which is the id of the product to remove

1. Getting a product : 
    ```bash 
    GET /catalog/:id
    ```
    ```${id}``` is the id of the product we want to get

1. Getting all the products
    ```bash 
    GET /catalog
    ```

## Examples

This section will give an example for each of the operations above. In these examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice.

1. Adding a product: (we assume that the image `banana` has been uploaded on the Azure Blob Storage before)
    ```bash
    curl -H 'Content-Type: application/json' -X POST -d '{"username": "admin", "role": "admin", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDY1MjUzMTAsImlhdCI6MTYwNTMxNTcxMCwic3ViIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.xB2uF3kdIhmMwlk6KbgtV2ZO28TuPNM79TUCrL-G5M8", "action": "add", "products":{"id": 0, "name": "banana", "category": "Fruits", "image": "https://soukeina.blob.core.windows.net/productimages/banana", "price": 5 }}' ${HOST_IP}:3011/catalog
    ```
    With this command, the `"user"` adds a `"banana"` whose `"id"` is 0, category is `"Fruits"`, image is `"banana"` and price is `5` to the catalog. He has a role `"admin"` and if the token is valid, he can successfully add the product in the catalog. The action of adding a product is specified by the field `"action"` which has the value `"add"`.

1. Modifying a product:
    ```bash
    curl -H 'Content-Type: application/json' -X POST -d '{"username": "admin", "role": "admin", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDY1MjUzMTAsImlhdCI6MTYwNTMxNTcxMCwic3ViIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.xB2uF3kdIhmMwlk6KbgtV2ZO28TuPNM79TUCrL-G5M8", "action": "modify", "products":{ "id": 0, "price":15, "category": "Vegetables" }}' ${HOST_IP}:3011/catalog
    ```
    With this command, the `"user"` modifies `"banana"` (identified by its `"id"` 0) by changing the `"price"` to `15` and changing its category which is now `"Vegetables"`. The action of modifying a product is specified by the field `"action"` which has the value `"modify"`.

1. Deleting a product:
    ```bash
    curl -H 'Content-Type: application/json' -X POST -d '{"username": "admin", "role": "admin", "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDY1MjUzMTAsImlhdCI6MTYwNTMxNTcxMCwic3ViIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.xB2uF3kdIhmMwlk6KbgtV2ZO28TuPNM79TUCrL-G5M8", "action": "delete", "products": 0}' ${HOST_IP}:3011/catalog

    ```
    With this command the `"user"` removes `"banana"` (identified by its `"id"` 0) from the catalog. The action of deleting a product is specified by the field `"action"` which has the value `"delete"`.

1. Getting a product: 
    ```bash
    curl -X GET ${HOST_IP}:3011/catalog/0
    ```
    This command retrieves the product whose `"id"` is 0 (here it is banana) from the catalog.

1. Getting all the products:
    ```bash
    curl -X GET ${HOST_IP}:3011/catalog
    ```
    This command retrieves all the products form the catalog, sorted by categories.

## Limitations

We were not able to upload an image to the Azure Blob Storage directly from the microservice. However, we still provided a way to do it from a terminal using Azure CLI, which we described above.

## Tests

This microservice can be tested with ```curl``` in different use-cases. The case below was tested and worked, but you can verify it yourself. You have to use the commands described in the **Examples** section.

The very first step is to upload an image to Azure Blob Storage by following the procedure described earlier (**Uploading an image on Azure Blob Storage** section). In our case, we need this image to be called `banana` in the storage.

An authenticated user (with role admin) can first add a product in the catalog using the first command. We can check if it worked by looking directly in the catalog database if the document with key `banana` exists. An other way is to use the fourth command to get the product `banana` (so with an id of 0). The result should be the following : 
```bash
{"status":"success","item":{"id":0,"name":"banana","category":"Fruits","image":"https://soukeina.blob.core.windows.net/productimages/banana","price":5}}
```

The user can modify the product by using the second command. Again we can see if it worked by checking the fields of the document in the catalog database, or by using the fourth command whose result should be the following:
```bash
{"status":"success","item":{"id":0,"name":"banana","category":"Vegetables","image":"https://soukeina.blob.core.windows.net/productimages/banana","price":15}}
```

Before deleting the product, we can first test the get operations (fourth and fifth commands).
For the "getting a product" command, the result has been described at the previous step so let's just describe what is expected when we get all the products. By using the fifth command, we are expecting the following result:
```bash
{"status":"success","output":{"Vegetables":{"0":{"id":0,"name":"banana","category":"Vegetables","image":"https://soukeina.blob.core.windows.net/productimages/banana","price":15}}}}
```
We can see that the output has the category present in the catalog as key and a list containing the product as value.

Finally, the user can delete the product `banana` from the catalog by using the third command. We can check if it worked by looking in the catalog database if the document `banana` is still in there or not (it shouldn't), or by trying to get `banana` (fourth command) which sould return an error as following : 
```bash
{"status":"error","message":"TypeError: Cannot read property 'products' of undefined"}
```

Each of these steps should produce logs in the logs database. We should be able to access performance logs for all the different steps included in this process, as well as a log of all 5 operations made here. More details in the logger microservice documentation.

## Changes made since the first deliverable

We modified several things in order to be more compatible with the way the front-end works:

- As said above, since we now need to enter the URL of an image in the front-end, we modified the way we add (or modify if we want to change the image) a product in the catalog: now we directly put the URL in the curl query and this URL can be obtained by following the small tutorial we made in the **Uploading an image on Azure Blob Storage** section.

- We added explanations on how the Azure Blob Storage blob container is created (in the **Creation of the Azure Blob Storage blob container** section). **Note:** it was already done for the first deliverable, we just did not explain how it was done.


- Now, each product is identified by a unique id and not by a unique name (which now sounds like a bad idea). So a field ```id``` must appear in all the products. With this change, when we want to delete a product, we need to provide its id and not its name. The same goes for getting a specific item, when we now get it by id and not by name. We modified the API, the examples and the results of the test in consequence.

- When getting all the catalog, this not a list of products for each category anymore but JSONs of products, with their ids as keys. This change was made to be more coherent with the fornt-end and so to make the link more easily.

- In the code, we separated the get function into two smaller get functions: a get for all the catalog and a get for an item in order to be more clear.

