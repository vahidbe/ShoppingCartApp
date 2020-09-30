# :books: LINGI2145 Project: Authentication microservice

**LINGI2145 Autumn, 2020** -- *Etienne Rivière, Guillaume Rosinosky and Raziel Carvajal-Gómez*

## Objectives

This tutorial will show you how to:

1. Understand the design of an authentication microservice;
1. Build and deploy a first back-end microservice written in node.js;
1. Call this microservice from the front-end.

:bulb: **Recall.**
We encourage you to follow the tutorial solo.

:bulb: **Recall.**
This tutorial requires you to complete some exercises that are tagged with this icon: :pencil2:

## Introduction

The authentication microservice (AuthServ for short) exposes a REST API over HTTP.
It stores authentication information of users in memory.
In other words, information is not persistent.
The table below is a description of the REST API AuthServ exposes.

| Method | Uniform Resource Name (URN) | Required  parameters | Output | Description |
|:------:|:-----------------------------|:-------------------------------------:|:--------------------:|:--------------------------------------------------|
| POST | /user | username=[string] & password=[string] | Authentication token | Register a new user |
| GET | /user/:username/:password | - | Authentication token | Log in a user |

## Build and deploy

Back-end services for the shopping cart application go in folder `src/backend`.
This folder contains a single microservice, AuthServ.
Its source code is organized as follows:

``` text
src/back-end/users/
├── Dockerfile    << Docker file
├── gulpfile.js   << configuration file of development tasks
├── package.json  << node.js configuration file
└── src/
    ├── app.js    << REST API
    ├── daemon.js << launch the HTTP server
    └── utils/  << utils to create authentication tokens
```

Main files are in `src/`:

- `daemon.js`: is the entry point of the application, which launches an HTTP server.
- `app.js`: implements the logic of the authentication service and defines its REST API.
- `utils/`: contains helper functions used in the microservice implementation.

:pencil: **Exercises.**
Complete the following tasks to build and deploy AuthServ:

1. Build the docker image with the name `scapp-auth`;
1. Run the container in the background mapping the internal port 80 with an external (i.e.: on the virtual machine) PORT_AUTH of your choice.
1. Get the logs of the running container with the command `docker logs` - read the documentation of this command if necessary.

## Test AuthS with `curl`

You are now ready to test the REST API of AuthServ using the `curl` command-line HTTP client.

:bulb: **Documentation.** Find more details about the `curl` command in the official documentation ([link here](https://curl.haxx.se/docs/faq.html#What_is_cURL))

1. **Users registration**. Create a new user (new resource) using the interface `POST /user`:

    ```bash
    curl -X POST --data "username=admin&password=admin" localhost:PORT_AUTH/user
    ```

    Look at the logs of AuthS:
      - *What do you receive as an answer?*
      - *What is the meaning of the HTTP status code 200?*
      - You receive an authentication token within the answer of this call.
      *What do you think is the purpose of this token?*

1. **Users authentication**. `GET /user/:username/:password` authenticates the resource identified by `:username`, test this call with an unregistered user with: `curl -X GET localhost:PORT_AUTH/user/bob/alice`

- *What happens?*
- *What is the meaning of the status code 404?*
- Test again the same call with the user you create in step 1
  - *What happens now?*
  - *What might be the propose of having a new authentication token?*

## Source code

It is important to understand how AuthS is built before writing new microservices.

AuthS is a node.js server built with [express](https://github.com/expressjs/express), a framework to create HTTP servers.
The initial configuration of this server is in [../src/back-end/users/src/daemon.js](../src/back-end/users/src/daemon.js).
The following shows an extract:

```javascript
/* [...] */
// the REST API that AuthS expose is within the file app.js
const app = require('./app');
/* [...] */
// launch an exception when a request is not part of the REST API
server.use((req, res, next) => {
  const err = new Error('Not Found')
  /* [...] */
})
// OR we respond with the status code 500 if an error occurs
server.use((err, req, res, next) => {
  /* [...] */
  res.status(err.status || 500)
  res.json({
    status: 'error',
    message: err
  })
})
// daemon is now listening on port 80
const port = 80
server.listen(port, function () {
  log(`Listening at port ${port}`)
})
```

The concrete implementation of each REST call in AuthS is in [../src/back-end/users/src/app.js](../src/back-end/users/src/app.js).

Here, we present a stub of the call `POST /user` (other calls follow a similar structure).

``` javascript
app.post('/user', (req, res) => {
  var usr = req.body.username
  var usrPassw = req.body.password
  log(`Creating a new user (${usr}) identified with "${usrPassw}"`)
  return db.createUser(usr, usrPassw)
    .then((token) => {
      // successful creation of the user returns an authentication token
      res.status(200).json({ status: 'success', token })
    })
    .catch((err) => {
      // Creation of the authentication token failed or the user was already registered
      res.status(500).json({ status: 'error', message: String(err) })
    })
})
```

In the previous snippet, you may have noticed that function calls are chained.
AuthS uses [Javascript Promises](https://scotch.io/tutorials/javascript-promises-for-dummies) to guarantee the order in asynchronous calls.
A REST call in our microservice succeeds if every operation in the chain of functions succeeds.

## Call AuthS from the front-end

This section explains how to link the REST API of AuthS from the provided front-end.
Open [`../src/front-end/src/interfaces/AuthenticationService.jsx`](../src/front-end/src/interfaces/AuthenticationService.jsx).
This is the source code that stores authentication information locally (i.e., in the browser temporary storage).

:pencil2: Replace the whole content of this file with the code below.
It is important to read and understand the content and principles of this code.
Use resources on-line if necessary to make sure you have a clear vision of how the code works: you will need to be able to write similar code for your own services.

``` javascript
import axios from 'axios' // we use this library as HTTP client
// you can overwrite the URI of the authentication microservice
// with this environment variable
const url = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3000'

class AuthenticationService {
    // setters
    setHandlers (onSucc, setAuthStatus, changeRoute) {
        this.onSucc = onSucc
        this.setAuthStatus = setAuthStatus
        this.changeRoute = changeRoute
    }
    // POST /user
    // ${data} is a JSON object with the fields
    // username=[string] and [password]. These fields
    // matches the specification of the POST call
    registerUser (data, onErr) {
        window.localStorage.setItem('username', JSON.stringify(data.username))
        axios.post(`${url}/user`, data) // Perform an HTTP POST rquest to a url with the provided data.
            .then((res) => {
                // we keep the authentication token
                window.localStorage.setItem('authToken', JSON.stringify(res.data.token))
                this.setAuthStatus(true)
                this.onSucc(`Successful registration of user [${data.username}]!`)
                this.changeRoute('/')
            })
            .catch((error) => {
                console.error(error.message)
                var msg = `Registration of user [${data.username}] failed.`
                onErr(`${msg} Error: ${error.msg}`)
            })
    }
    // GET /user/:username/:password
    loginUser (data, onErr) {
        window.localStorage.setItem('username', JSON.stringify(data.username))
        axios.get(`${url}/user/${data.username}/${data.password}`) // Perform an HTTP GET rquest to a url.
            .then((res) => {
                window.localStorage.setItem('authToken', JSON.stringify(res.data.token))
                this.setAuthStatus(true)
                this.onSucc(`Welcome back [${data.username}]!`)
                this.changeRoute('/')
            })
            .catch((error) => {
                console.error(error.message)
                onErr(`User [${data.username}] is not registered or his credentials are incorrect.`)
            })
    }
}

export default AuthenticationService
```

The functions *registerUser()* and *loginUser()* perform (respectively) a HTTP request of the AuthServ REST API.

:warning:
Note that the URL of AuthServ is taken from the environment variable `REACT_APP_AUTH_SERVICE_URL`. Be sure you set this variable accordingly, either in the Dockerfile or using the option `-e` in the command `docker run`.

Now, rebuild the front-end image and re-launch the container.

Open to the web interface, register a new user, and log out.
Close your web browser, and re-open the application.
You will notice that you are now able to log in using the same credentials, as those are now stored in the backend.

:pencil: Confirm that AuthS receive calls to its API by consulting its logs.

:checkered_flag: **This is the end of this tutorial.**
You have now an overview of the development of a web application using modern Cloud technologies.
Refer to the [deliverables section](../README.md#deliverable) of the project description for more details about your future assignments.
