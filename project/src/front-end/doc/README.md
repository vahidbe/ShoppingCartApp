# :books: Documentation of front-end for SCApp

In this folder you will find the source code to build the documentation of the front-end for SCApp. The documentation is built with the framework [docz](https://www.docz.site/docs/project-configuration) that creates several HTML pages. The main HTML page of the documentation will be served by an HTTP server that runs in a Docker container. You can deploy such container as follows:

1. Create docker image;
    - `docker build -t scapp-fe-doc .`

1. Deploy a web server that host the documentation;
    - `docker run -d -p 3003:5000 --name scapp-fe-doc scapp-fe-doc`
      - :warning: This process might take about 3 mins.

1. Consult the documentation in your web browser writing down the IP address (followed by `:3003`) of the machine running docker.
