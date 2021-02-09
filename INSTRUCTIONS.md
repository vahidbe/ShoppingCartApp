# Instructions

## Project part A

### Setup

This part is based and/or using sections of the tutorials as the operations to do are essentially the same.

#### Building the containers

As the application is already compiled and uploaded to the `vahidbe` account on Docker Hub, it is not needed to rebuild the containers. However, the following command allows you to rebuild them:
```bash
./buildContainers
```
If you want to build and push them again on Docker Hub, you can use the command:
```bash
./buildAndUploadContainers
```
But you might need to modify the Docker Hub account in this script with your own Docker Hub account.

#### Setting up the virtual infrastructure

These instructions are to deploy the scapp application on azure. However, if you wish to deploy it locally, you can ignore all steps related to azure and skip to the swarm section, to deploy a swarm locally. However, we must deploy a swarm in order for the running script to work, so you cannot skip the swarm deployment section.

First create a resource group in the west-europe data centre with:

```bash
az group create --name lingi2145.weu --location westeurope
```

##### Creation of two VM with docker

1. Create an instance of an Ubuntu VM with Docker with this command:

    ```bash
    az group deployment create --resource-group lingi2145.weu --template-uri https://tinyurl.com/azure-template
    ```

1. You are asked to provide a user name and password for the administrator's account.

    [The rules](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_good_password) to create a valid password, for a GNU/Linux system, apply in this step.

1. You are also asked to provide a DSN name.

    A valid DNS name is a string of up to 63 alphanumeric characters. Such a string follows this regular expression `^[a-z][a-z0-9-]{1,61}[a-z0-9]$`

1. You are asked to provide the user name of your Github account

    This avoids having 2 VMs with the same DNS name

    Please, use lower case and respect this regular expression `^[a-z][a-z0-9-]{1,61}[a-z0-9]$`

1. **Wait** until the creation of the VM.

1. The DNS name of your new VM is set to:

    ```bash
    ${PROVIDED_DNS_NAME}-${PROVIDED_GITHUB_ACCOUNT}.westeurope.cloudapp.azure.com
    ```

1. Log in to your new VM via SSH as follows:

    ```bash
    ssh ${USER_NAME}@${PROVIDED_DNS_NAME}-${PROVIDED_GITHUB_ACCOUNT}.westeurope.cloudapp.azure.com
    ```

    Write down the administrator's password you set before.

1. Create an SSH key pair to access your VM without writing down the administrator's authentication information.

1. Repeat those operations for a second VM

##### Ingress port rules
By default, VMs in Azure allow inbound traffic only for SSH connections (on port 22). To deploy services in Docker, we need to allow inbound traffic for Docker swarm and also, for the API of each service you want to expose to the world. You can do so following these steps:

1. In the Azure Home page, write down *Network security groups* in the search bar and chose the option *Network security groups (classic)*;

1. Click on the *Add* button, chose the name of your resource group and give a name for this resource (as shown below). Then, click on the *Review + create* button;

1. Select the view *Virtual machines* in the Azure Home page, click on the name of your VM, select *Networking* in the list of settings and click on the name of the **Network Interface**;

1. You will be directed to the configuration page of the Network Interface of your VM. Choose *Network security group* in the list of settings and click the Edit button (blue pencil icon).

1. Add a new group by clicking on the word *None*, chose the name of the group and click on the *Save* button;

1. Go back to the networking settings of your VM, as explained before in step No 3, click on the blue button *Add inbound port rule* and write down the following list of ports `80,8080,22,3000-3015,2377,7946,4789` in the text field: *Destination port ranges*. Confirm the changes by clicking on the *Save* button.

##### Creating a Docker Swarm

1. Open a terminal in the manager VM to instantiate a swarm:

    ``` bash
    docker swarm init --advertise-addr IP_OF_VM_LEADER
    ```

    With IP_OF_VM_LEADER being the public IP address of the leader VM on Azure. You should find this address in the informations of your VM on Azure. However, if you wish to deploy the application on a local VM, you can use its address instead.

    You should get an output similar to the following one:

    ```bash
    Swarm initialized: current node (3u3ewnwinnsi4novo17c4cw0o) is now a manager.

    To add a worker to this swarm, run the following command:

        docker swarm join --token SWMTKN-1-5sz3pfslthuequk897uczy54saelf6f0skb79vgiz5f75vafon-2513wgtqxa9tb5j1sg4xhdomb 137.117.150.17:2377

    To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
    ```

    The command to create a swarm also shows a command to add new nodes to the swarm.
    Use this command in the second VM to add a new node to the swarm.

1. Create a network of containers as follows.

    ```bash
    docker network create --driver overlay --attachable scapp-net
    ```

##### Moving the necessary files to the Azure VM

1. Copy the necessary files of scapp with (and type your password when required):

    ```bash
    scp GIT_ROOT/project/src/scapp.yml ${USER_NAME_OF_SWARM_MANAGER}@${SWARM_MANAGER_WITH_FULL_AZURE_DSN_NAME}:~/
    ```

    ```bash
    scp GIT_ROOT/runBackEnd.sh ${USER_NAME_OF_SWARM_MANAGER}@${SWARM_MANAGER_WITH_FULL_AZURE_DSN_NAME}:~/
    ```

    ```bash
    scp GIT_ROOT/stopBackEnd.sh ${USER_NAME_OF_SWARM_MANAGER}@${SWARM_MANAGER_WITH_FULL_AZURE_DSN_NAME}:~/
    ```

    ```bash
    scp GIT_ROOT/runFrontEnd.sh ${USER_NAME_OF_SWARM_MANAGER}@${SWARM_MANAGER_WITH_FULL_AZURE_DSN_NAME}:~/
    ```

    ```bash
    scp GIT_ROOT/stopFrontEnd.sh ${USER_NAME_OF_SWARM_MANAGER}@${SWARM_MANAGER_WITH_FULL_AZURE_DSN_NAME}:~/
    ```

    If you wish to deploy the application locally, you must do the preceding instructions using the address of your local VM, if those files are not already there. If you cloned the repository there directly, then there is no need to do them.

### Deployment

1. Run the back-end deployment script with:

    ```bash
    ./runBackEnd.sh ${LOCAL}
    ```

    For the `${LOCAL}` argument, use true if you wish to use the local builds optained with `./buildContainers`, or false if you would rather use the dockerHub images. If you are running the back-end on Azure, you should leave this argument empty (or set it to false) unless you cloned the repository and built the containers on the Azure VM.

1. To stop the back-end, run the following command:

    ```bash
    ./stopBackEnd.sh
    ```

1. To run the front-end, use:

    ```bash
    ./runFrontend.sh ${BACKEND_URL} ${LOCAL}
    ```

    `${BACKEND_URL}` is the url to the VM where the back-end was deployed (starting with `http://`). If it was deployed on Azure, use the public IP address of your Azure VM. If you want to access our VM, you can ask us by email (vahid.beyraghi@student.uclouvain.be or soukeina.bojabza@student.uclouvain.be) so that we can turn it on. You will then be able to reach the back-end and the front-end with the following address: `vahidbe@swarm-leader-vahidbe.westeurope.cloudapp.azure.com`. You can also only deploy the front-end on your side with that address given in argument.

    For the `${LOCAL}` argument, use true if you wish to use the local builds optained with `./buildContainers`, or false if you would rather use the dockerHub images. If you are running the back-end on Azure, you should leave this argument empty (or set it to false) unless you cloned the repository and built the containers on the Azure VM.
 
1. To stop the front-end, run the following command:

    ```bash
    ./stopFrontEnd.sh
    ```