# :books: NoSQL databases

**LINGI2145 Autumn, 2020** -- *Etienne Rivière, Guillaume Rosinosky and Raziel Carvajal-Gómez*

## Introduction

This tutorial provides you with the basics in [CouchDB](http://docs.couchdb.org/en/stable/index.html), a popular NoSQL database.
The provided authentication service for the LINGI2145 project keeps users' information in memory.
We will learn how to link this service to a Docker container running CouchDB to store authentication information permanently.

### Objectives

Concretely, this tutorial shows you how to:

1. Set up a container supporting CouchDB;
1. Use the REST API of CouchDB;
1. Store authentication information of users in a CouchDB database;
1. Consult the stored data with Fauxton - the GUI (Graphical User Interface) of CouchDB;
1. Crate views to query objects in CouchDB.

### Prerequisites

:warning:
If you **have not completed** the authentication service tutorial ([link here](./02_ProjectSetup_AuthenticationService.md#books-lingi2145-project-authentication-microservice)), do it before going through this tutorial.

:bulb: **Recall.**
We encourage you to follow the tutorial solo.

:bulb: **Recall.**
This tutorial requires you to complete some exercises that are tagged with this icon :pencil2:

## CouchDB in a Nutshell

CouchDB is a NoSQL database system where data is kept in the form of JSON documents.
CouchDB provides an HTTP REST API to interact with this data and manage databases.

We provide you with a Dockerfile to create a pre-configured image of CouchDB.
The folder [../src/back-end/storage](../src/back-end/storage) contains this Dockerfile.

:pencil2: **Exercises.**
Complete the following tasks to build an image and create a container:

1. Build an image of the provided Dockerfile and name it `kv-storage-system`;
1. Run a container of this image using the port mapping rule `-p 3000:5984` and named `users-db`.
    - `3000` is an available port in the host running Docker;
    - `5984` is the port number CouchDB uses by default.
    - :warning: **Keep `users-db` running.** You will make use of this container in the following sections.

Use `curl` to use the REST API of CouchDB to verify that the container is running--replace `${HOST_RUNNING_DOCKER}` by the IP address of the VM hosting the container. If you launch it directly on the host of the Docker Daemon, use `localhost`.

```bash
curl -X GET http://${HOST_RUNNING_DOCKER}:3000
```

You will get the following JSON object:

```json
{
  "couchdb":"Welcome",
  "version":"3.1.1",
  "git_sha":"ce596c65d",
  "uuid":"c6dd9671f793e33edc104029f75faee3",
  "features":[
    "access-ready",
    "partitioned",
    "pluggable-storage-engines",
    "reshard",
    "scheduler"
  ],
  "vendor":{
    "name":"The Apache Software Foundation"
  }
}
```

CouchDB comes with a GUI called [Fauxton](http://docs.couchdb.org/en/stable/intro/tour.html?highlight=fauxton#welcome-to-fauxton) that you can see from your Web browser by typing the address *${HOST_RUNNING_DOCKER}:3000/_utils*.
You should see the following login page:

![couchdb-fauxton](images/fauxton.png)

To log in as administrator using **admin** as user name and also as password.

Below, you have a list of useful commands. Execute such commands and note the effect on the Fauxton GUI (you might to refresh the web page to after every command).

1. Create a database--replace the variable `DB_NAME` with the name of your choice;

    ```bash
    curl -X PUT admin:admin@${HOST_RUNNING_DOCKER}:3000/DB_NAME
    ```

1. List all databases;

    ```bash
    curl -X GET admin:admin@${HOST_RUNNING_DOCKER}:3000/_all_dbs
    ```

1. Store a JSON document;

    ```bash
    curl -X POST --data '{"date": "01/01/1968", "event": "watch-tv"}' -H "Content-Type: application/json" admin:admin@${HOST_RUNNING_DOCKER}:3000/DB_NAME
    ```

1. Delete a database with its name `DB_NAME`:

    ```bash
    curl -X DELETE admin:admin@${HOST_RUNNING_DOCKER}:3000/DB_NAME
    ```

:pencil: **Note.**
This is just an introduction to CouchDB: in the following section, you will learn how to query stored JSON documents. Find more details about how to handle databases in the following links:

- [Get started guide](http://docs.couchdb.org/en/stable/intro/tour.html#getting-started)
- [Design of JSON documents](http://docs.couchdb.org/en/stable/ddocs/ddocs.html#design-documents)

## Use CouchDB in your project

In the context of the LINGI2145 project, the authentication microservice we built during the previous tutorial does not store authentication information of users in persistent storage but keeps that information in memory [see here](../src/back-end/users/src/utils/crud.js#L13-L15).

Instead, we would like to use a CouchDB database to store this data.

:pencil2: **Exercise**.
The Dockerfile of the authentication microservice has changed. Please, **build again the image of this microservice**.

We will use [nano](https://github.com/apache/nano#nano), a NPM library, to access the REST API of CouchDB from the authentication microservice by using a *wrapper* (link to code [here](../src/back-end/users/src/utils/crud-wp.js)).

The database will be queried with nano from a NodeJS program, simply, using the URL of the CouchDB database.
To set the URL of the database, we use the environment variable `DB_URL` (defined in the Dockerfile of the authentication microservice, link to code [here](../src/back-end/users/Dockerfile#L30)). Now, we simply create an object to access the database as follows:

```javascript
var users = require('nano')(process.env.DB_URL)
```

Concretely, the complete URL needed by `nano` to access the database of users has the following structure: `${ADMIN_NAME}:${ADMIN_PASSW}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, where:

- `ADMIN_NAME/ADMIN_PASSW`: username and password to perform operations (create/remove/update/delete) on objects in our DB;
- `DB_HOST`: name of container running CouchDB;
- `DB_PORT`: port where CouchDB is listening;
- `DB_NAME`: name of the database.

:pencil2: **Exercises.**

1. Run an instance of the authentication microservice as follows;

    ```bash
    docker run -d -p 3001:80 --name auth-service --link users-db AUTH_SERVICE_IMAGE_NAME
    ```

    :warning: **Notice that:**
    - You have to replace `AUTH_SERVICE_IMAGE_NAME` with the name of the image of the authentication microservice you previously built;
    - The option `--link` facilitates communication with the CouchDB container (named `users-db`).

1. Consult the logs of the container and make sure the service was properly started;
1. Test the authentication microservice API by registering a new user (see previous [tutorial](02_ProjectSetup_AuthenticationService.md#test-auths-with-curl));
1. Use the Fauxton API to ensure the new user's details have been stored in CouchDB.

:bulb: **Note**.
You might have noticed that now the authentication microservice is launched with the script [boot-in-order.sh](../src/back-end/users/Dockerfile#L33). Given that the microservice now depends on a CouchDB instance, it needs to ensure that the database has been deployed before starting dispatching requests.

You now know how to store and get objects with CouchDB.
Queries for individual objects will follow this pattern.
In the following, we show how to run *queries* over a collection of objects, directly over CouchDB (i.e. without retrieving a set of keys and filtering them locally).

## Querying objects in CouchDB

We will show you, using the GUI of CouchDB, how to query stored objects.
The ability to query, e.g. find a set of values according to some criteria, will prove useful for some of your microservices, where fetching and storing individual keys only may be cumbersome.

### Use Case: querying grocery orders

As a member of the World Health Organization (WHO), you are in charge of reporting the number of products that US citizens buy on-line, grouped by departments.

You are provided with a sample of the Open Source dataset of [Instacart](https://tech.instacart.com/3-million-instacart-orders-open-sourced-d40d29ead6f2) in form of a CouchDB database.
Orders are kept as JSON objects with the following format.

```json
{
  "order_id": 4,
  "product_id": 46842,
  "product_name": "Plain Pre-Sliced Bagels",
  "department_name": "bakery"
}
```

:pencil2: **Exercises.**
Get access to this database as follows.

1. Build an image, with the name `instacart-sample`, from the Dockerfile in the `instacart` directory;
1. Run a container of `instacart-sample` and link it with the container `users-db`:

- **Recall.** The option `--link` facilitates the communications of a running container with already deployed containers.

1. Consult the logs of this running container.

The deployed container creates the `instacart` database and stores a sample of the Instacart dataset. You can confirm that there is a new database in the container running CouchDB, using the GUI (as shown below).

![couchdb-instacart](images/instacart-db.png)

The database also contains the query **departments** to list every department in the on-line store.
You can see the output of it by clicking on ***queries > departments*** right below the category ***Design Documents*** (see image below).

![couchdb-instacart](images/instacart-view.png)

Observe that a function in JavaScript is required to select all departments.
You can see the implementation of this query by clicking on the wrench icon (:wrench:) next to  ***departments*** and then select the edit option (see image below).

![couchdb-instacart-view](images/couchdb-view.png)

The function is executed over all documents stored in the database (*line 1*).
One document refers to a department **if an only if** the fields `department_id` & `department_name` are present (*line 2*).
Finally, the emit function (*line 3*) add an entry of interest to the result set with the department identifier as key and the name of the department as value (remember, documents in CouchDB are key-value objects).

To accomplish your mission as a member of WHO, we will simply query the database for the number of purchased products, grouped by department, over the whole dataset.

Given that we need to count the number of products per department, our JavaScript function will simply report `1` when a product from a certain department is found. Here you have the implementation of such query:

```javascript
function (doc) {
  // we assure that [doc] refers to one purchase
  if ( doc.order_id && doc.department_name ) {
    // we report once the department of a product
    emit(doc.department_name, 1);
  }
}
```

Now we just have to sum the number of occurrences per department.
To do so, we will use the built-in `SUM` function of CouchDB. Follow the next steps to implement our view:

1. Click on the plus icon (**+**) next to **queries**, right below **Design Documents** and select **New View**
1. In the field **Index name** write the name of our view: **items_per_dept**
1. Replace the code within the field **Map function** with the snippet shown before
1. Chose **_sum** as reduce function
1. Save the view by clicking on **Create Document and then Build Index**

That's it, you already know how many products were bought per department.
Corroborate the output of the query writing down in a terminal (on your laptop) the next command:

```bash
curl -X GET admin:admin@${HOST_RUNNING_DOCKER}:3000/instacart/_design/queries/_view/items_per_dept?group=true
```

you will get an output similar to this one:

```javascript
{"rows":[
{"key":"alcohol","value":2},
{"key":"babies","value":13},
{"key":"bakery","value":31},
{"key":"beverages","value":77},
{"key":"breakfast","value":16},
{"key":"bulk","value":2},
{"key":"canned goods","value":36},
{"key":"dairy eggs","value":163},
{"key":"deli","value":39},
{"key":"dry goods pasta","value":28},
{"key":"frozen","value":73},
{"key":"household","value":37},
{"key":"international","value":10},
{"key":"meat seafood","value":25},
{"key":"missing","value":1},
{"key":"other","value":2},
{"key":"pantry","value":54},
{"key":"personal care","value":25},
{"key":"pets","value":5},
{"key":"produce","value":282},
{"key":"snacks","value":78}
]}
```

## Final comments

:checkered_flag: **That's it, you made it.**
You have now the basics of how to use CouchDB and query stored objects in CouchDB databases.
