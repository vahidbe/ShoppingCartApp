# :books: LINGI2145 Project: Grading Rules

**LINGI2145 Autumn, 2020** -- *Etienne Rivière, Guillaume Rosinosky and Raziel Carvajal-Gómez*

## Introduction

As the project is split in **two parts**, there will be **two deliverables**:

- The first deliverable is the shopping cart application with its back-end services, and all deployment scripts and documentation we need to be able to launch it;
- The second deliverable is the support of a recommendation service on top of the first deliverable, again with launch scripts and documentation.

**Final grade calculation rules:**

- The first project accounts for 60% of the final grade.
- The second project accounts for 40% of the final grade.
- :gift: Bonus points are applied to the final grade.

  - If X (max 60) is the score for the first project, and Y (max 40) the score for the second project, and if you secured Z bonus points, then your final grade is MIN(100,X+Y+Z)/100 points.

## First deliverable: Shopping-cart application

The first deliverable is due **Monday, November 9, 2020, 23:59** (before the lecture).
**There will be no extension.**

The deliverable should be provided to us as a link to your private fork of the repository (one link per group only!) together with the identifier of the last commit we should look at.
*If the provided commit's date on GitHub is after the deadline, we will consider the latest commit before the deadline instead.*
This information should be entered on the [Moodle assignment](https://moodleucl.uclouvain.be/mod/assign/view.php?id=767272).

### Expected content of the deliverable

According to the [project objectives description](README.md) you are playing the role of the back-end development team, and we (instructor and teaching assistants) are the front-end development team.
We provided you with the front-end service running with local storage, and your role was to build the back-end services to be deployed on the cloud :cloud:.

Your deliverable must allow the front-end service team to deploy and run the back-end service and perform some tests using the new version of the front-end containing calls to the appropriate services.

Each service must be packaged as a docker container, with scripts able to run properly multiple instances of the service as part of a Docker Swarm.

All services must be implemented in the node.js programming language.
Accompanying scripts can use bash, or another high-level interpreted language suitable for scripting.

**The documentation must contain:**

- a list of services, detailing:
  - the role of the service;
  - the associated technologies;
  - how to build the container, or the description of a provided script that builds all containers automatically;
  - how to run a swarm of instances of the container in a VM hosted in the cloud (you do not need to tell us how to run VMs), or a pointer to the script that is doing this for us automatically;
  - the complete API of the service.
- a justification of the technology choices for the different services;
- a list of items logged in the logging service;
- how to deploy all services on one or multiple VMs, preferably associated with a deployment script;
- what is the required configuration on Microsoft Azure besides what the deployment scripts do (in particular, if there is need to deploy new [Azure blobs](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction), set up security groups, register Azure Functions, or anything else).

**The code must contain:**

- all microservices under explicit folder names;
- all scripts required to deploy and run the back-end, including configuration scripts for Azure using the command line interface or the programmable API (if you did not use these, there must be a HOW-TO explaining what to do on the web interface, but this is less convenient);
- proper comments and presentation (indenting, no dead or commented code, etc.).

#### Grading rules

We will apply the following grading rules.
The maximal amount of points is 60 without the bonus points.
As detailed above, bonus points (up to 10 points for this part) are counted separately for the whole project (parts 1 and 2).
While the grading rules below give milestones for each criterion, we will also use intermediate grades when an objective is only partially met.

- **Criteria 1 (10 points):** *The project code is well-delivered and packaged.*
  - :sob: (0) The code base is a mess, there is no packaging in containers, there are no deployment scripts.
  - :disappointed: (2) There is some organization to the code base, but no packaging in containers or deployment scripts.
  - :neutral_face: (5) Back-end services are packaged in containers, the code base has some structure, but deployment scripts are not usable.
  - :grinning: (8) In addition, deployment scripts are usable with only minor hick-ups.
  - :heart_eyes: (10) The code is well-organized and packaged, and deployment script work without issues.
  - :gift: **Bonus (up to 5 points)**: The project contains an innovative feature that goes beyond what was required, and this feature is well implemented, useful, and detailed in the report.

- **Criteria 2 (10 points)**: *The project documentation is clear and complete (based on requirements above).*
  - :sob: (0) There is no project documentation.
  - :disappointed: (2) The project documentation is very incomplete.
  - :neutral_face: (5) The project documentation contains 80% of the required factual information.
  - :grinning: (8) The project documentation is complete and clear.
  - :heart_eyes: (10) Furthermore, all technological choices are well-justified.

- **Criteria 3 (10 points)**: *The back-end service is implemented using microservices.*
  - :sob: (0) There are no back-end services.
  - :disappointed: (2) The back-end service is a monstrous monolith.
  - :neutral_face: (5) There are different services but the separation of purposes is only partially correct.
  - :grinning: (8) Each micro-service has a clearly-defined role and the architecture makes sense.
  - :heart_eyes: (10) Furthermore, these roles are clearly described in the documentation.

- **Criteria 4 (8 points)**: *Back-end microservices are accessed using REST APIs.*
  - :sob: (0) There are no APIs.
  - :disappointed: (2) The APIs are using HTTP as a transport medium only (level 0 in the maturity model).
  - :neutral_face: (4) The APIs use the notion of resource, but not HTTP verbs (level 1).
  - :grinning: (6) The APIs use HTTP verbs to perform actions (level 2)
  - :heart_eyes: (8) Furthermore, they are well documented, not ambiguous and APIs for different services are consistent.

- **Criteria 5 (4 points)**: *All state is maintained in the back-end and a user connecting from a different browser session does not loose previous actions.*
  - :sob: (0) State is kept in the client's browser as in the provided code.
  - :neutral_face: (2) State is kept at the back-end side but closing the browser results in the loss of the session information.
  - :heart_eyes: (4) All state at back-end side and re-connecting works without any problems.

- **Criteria 6 (5 points)**: *There is a logging service, it uses CouchDB, and it is actively used by other services.*
  - :sob: (0) There is no logging service.
  - :neutral_face: (2) There is a logging service, but it does not use CouchDB or is not called by other services.
  - :grinning: (4) The logging service is called by other services and stores logs in CouchDB.
  - :heart_eyes: (5) Furthermore, the logs stored contain information useful for debugging and tracking the behaviour of users.

- **Criteria 7 (8 points)**: *The back-end services support elasticity.*
  - :sob: (0) None of the services support elasticity.
  - :disappointed: (2) Only the authentication service supports elasticity.
  - :neutral_face: (4) Most services implementations support elasticity, but there is no evidence of testing.
  - :grinning: (6) All service implementations support elasticity with Docker Swarm, and it has been tested.
  - :heart_eyes: (8) Furthermore, your group used workload injection at the front-end level to evaluate elasticity, and the result of this is clearly documented in the report.

- **Criteria 8 (5 points)**: *Products images are stored in an Azure blob and accessed directly by the front-end using their URIs. The administrator interface allows registering new products, storing their information in the back-end and the pictures on Azure Storage, and deleting existing products.*
  - :sob: (0) Product images are stored in the web server as in the original front-end implementation.
  - :neutral_face: (3) Product images are stored in an Azure blob and the front-end uses the URIs to download the images with HTTP GET calls.
  - :heart_eyes: (5) The administrator interface allows registering new products and associated images.
  - :gift: **Bonus (up to 5 points)**: When storing new products, the provided picture is first checked for formatting, and resized to meet the constraints of fast Web loading in the front-end application, before being stored to Azure Storage. This resizing is done asynchronously and not in the query/response loop of the administrator interface.

#### Getting early feedback

If you would like to know if you meet any of the above criteria, schedule an appointment with one of the teaching assistants or come ask during the lab hours.
You will get better feedback if you send a link to your code in advance by email.

## Second deliverable: recommendation service

This deliverable is due **Thursday December 14, 2020, 23:59**. **There will be no extension.**

The deliverable should be provided to us as a link to your private fork of the repository together with the identifier of the last commit we should look at.
_If the provided commit's date on GitHub is after the deadline, we will consider the latest commit before the deadline instead._

### Expected content

Your deliverable must allow the front-end service team to deploy and run the back-end service and perform some tests using the new version of the front-end containing calls to appropriate services.
Each service must be packaged as a *Docker container*, with scripts able to properly run multiple instances of the service as part of a Docker Swarm.

**The documentation must contain:**

- an updated list of services, detailing for every new service:
	- the role of the service;
	- the associated technologies;
	- how to build its container, or the description of a provided script that builds all containers automatically;
	- how to run a swarm of instances of the container, or a pointer to the script that is doing this for us automatically;
	- the complete API of the service.
- a justification of the technology choices for the new services;
- the principles and implementation of the Map/Reduce querie(s) used by your services;
- how to deploy all services on one or multiple VMs, preferably associated with a deployment script;
- screenshots of the recommendation service in action.

**The code must contain an evolution of the first part with:**

- all microservices under explicit folder names;
- all scripts required to deploy and run the back-end;
- proper comments and presentation (indenting, no dead or commented code, etc.).

### Grading rules

We will apply the following grading rules.
The maximal amount of points is 40 without the bonus points.
As detailed above, bonus points (up to 8 points for this part) are counted separately for the whole project (parts 1 and 2).
While the grading rules below give milestones for each criteria, we will also use intermediate grades when an objective is only partially met.

- **Criteria 1 (10 points):** *The project code is well-delivered and packaged.*
	- :sob: (0) The code base is a mess, there is no packaging in containers, there are no deployment scripts.
	- :disappointed: (2) There is some organization to the code base, but no packaging in containers or deployment scripts.
	- :neutral_face: (5) Back-end services are packaged in containers, the code base has some structure, but deployment scripts are not usable.
	- :grinning: (8) In addition, deployment scripts are usable with only minor hick-ups.
	- :heart_eyes: (10) The code is well-organized and packaged, and deployment script work without issues.
	- :gift: **Bonus (additional 3 points)**: You provide evidence that the application back-end runs properly on Microsoft Azure.

- **Criteria 2 (5 points)**: *The update of the project documentation is clear and complete (based on requirements above).*
	- :sob: (0) There is no project documentation or only the documentation from part 1.
	- :disappointed: (2) The project documentation is incomplete (including but not limited to, the absence of API description, no proper technology justification, or no deployment information).
	- :grinning: (4) The project documentation contains 80% of the required factual information.
	- :heart_eyes: (10) The project documentation is complete and clear.

- **Criteria 3 (5 points):** *The logging service enables the recommendation engine.*
	- :sob: (0) There is no logging service.
	- :disappointed: (2) There is a logging service but it does not log anything useful for the recommendation engine.
	- :grinning: (4) There is a logging service and it logs what the implemented recommendation engine needs, but not more.
	- :heart_eyes: (5) There is a logging service and it receives the correct information for the recommendation engine, but also for future evolutions of this service.

- **Criteria 4 (10 points):** *There is a back-end service implementing a recommendation engine.*
	- :sob: (0) There is no recommendation engine.
	- :disappointed: (2) The recommendation engine uses static recommendations, or recommendations that are not specific to a particular user activity.
	- :neutral_face: (5) The recommendation engine provides suggestions based on previous purchases of all users and employs a Map/Reduce periodic query. However, it has defaults such as presenting as a recommendation a product that the user already has in her cart.
	- :grinning: (8) The recommendation engine provides some suggestions based on previous purchases but its implementation does not use all optimizations the Map/Reduce framework provides.
	- :heart_eyes: (10) The recommendation engine provides some suggestions based on previous purchases and uses (an) optimized Map/Reduce query/ies.
	- :gift: **Bonus (additional 5 points)**: The recommendation engine uses a more advanced mechanism to provide suggestions, beyond the bought-most-frequently-with principle, and using information such as the previous purchases of the user, navigation history, etc.

- **Criteria 5 (10 points):** *There is an integration of the recommendation feature in the front-end.*
	- :sob: (0) There is no integration of the recommendation feature to the front-end.
	- :disappointed: (2) There is the beginning of an integration but it does not show recommendations properly.
	- :neutral_face: (5) The recommendations are provided as text links below the product description.
	- :grinning: (8) The recommendations are provided as thumbnails below the product description.
	- :heart_eyes: (10) The integration in the front-end is visually pleasant and usable.

#### Getting early feedback

If you would like to know if you meet any of the above criteria, schedule an appointment with one of the teaching assistants or come ask during the lab hours.
You will get better feedback if you send a link to your code in advance by email.
