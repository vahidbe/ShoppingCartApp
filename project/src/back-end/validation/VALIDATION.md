# Validation service: Documentation

## Description

The validation microservice has for goal to check if a user has correctly been authentificated.

It is contained in the container `validation-daemon` and is reachable at `${HOST_IP}:3005`

It communicates with the logger service to keep logs about the performance of the validation requests processed.

The logger must be running and linked with this microservice in order for it to work correctly.

In the sections below, we will mention some databases:  
1. By the logs database, we mean the database in the container `logs-db` reachable at `${HOST_IP}:3002`

It can handle one request:

1. Validating information: \
    This request takes the `username` of the user, its `role` as well as the `token` resulting from its authentification. The microservice checks that the `token` is not expired, and that it corresponds to the `username` and `role` provided. In that case, it returns with a status 200. Otherwise, a 401 error is thrown with a message explaining the reason (whether the token was expired or the username or role where not matching the ones in the token).

This request is called from the other microservices in order to verify that the user is authentificated and that he provided his actual `role` before doing any operation that requires the user the be authentificated.

## API

The interface of this microservice allows the request described above:

1. Validating information: 
    ```bash 
    GET /validation/:username/:role/:token
    ```
    - ```username```: a string identifying the user
    - ```role```: a string defining the role of the user that can be either ```"admin"``` or ```"user"```
    - ```token```: a string containing the authentification token of this user

## Examples

This section will give an example for the request described above. In the following examples, ```${HOST_IP}``` represents the IP address of the machine running this microservice.

1. Validating information:
    ```bash
    curl -X GET ${HOST_IP}:3005/validation/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYwNjI3NzAsImlhdCI6MTYwNDg1MzE3MCwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.CNJhSQWcwXojNufgld_8t6C5BM4__Lwaox2B0Ky8VVo
    ```
    This command checks that the user `"user"` has correctly been authentificated by checking that the given `token` matches the username `"user"` and the role `"user"`. It also checks that the `token` is still valid (that it has not expired).

## Tests

This microservice can be tested with ```curl``` in different use-cases. The cases below were tested and worked, but you can verify it yourself.

A user can create its profile with the `"user"` role, username and password using:
```bash
curl -X POST --data "username=user&role=user&password=user" ${HOST_IP}:3001/user
```
That requires the users microservice to be deployed as well.
He should get a results similar to the following:
```bash
{"status":"success","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYyNDc3NTIsImlhdCI6MTYwNTAzODE1Miwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.cxe8jy3So2vMIickY0oWgF7fiEAqzs2vOKmzEUT-xno"}
```
He can then verify that he has been identify correctly with (using the same token and role that he used and received in the registration):
```bash
curl -X GET ${HOST_IP}:3005/validation/user/user/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYyNDc3NTIsImlhdCI6MTYwNTAzODE1Miwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.cxe8jy3So2vMIickY0oWgF7fiEAqzs2vOKmzEUT-xno
```
He should get in return a success as such:
```bash
{"status":"success"}
```
However, if the user tries to do a request with the `"admin"` role:
```bash
curl -X GET ${HOST_IP}:3005/validation/user/admin/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDYyNDc3NTIsImlhdCI6MTYwNTAzODE1Miwic3ViIjoidXNlciIsInJvbGUiOiJ1c2VyIn0.cxe8jy3So2vMIickY0oWgF7fiEAqzs2vOKmzEUT-xno
```
He will get the following answer:
```bash
{"status":"error","message":"Error: Incorrect role"}
```

If he does not send a correct token, he will get this answer:
```bash
{"status":"error","message":"Error: Signature verification failed"}
```
He will receive similar error messages if the `username` does not match the one encoded in the token or if the token has expired.

Each of these steps should produce logs in the logs database. We should be able to access performance logs for all the different steps included in this process. More details in the logger microservice documentation.