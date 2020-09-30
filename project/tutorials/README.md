# :books: LINGI2145 Project: bootstrap tutorial

**LINGI2145 Autumn, 2020** -- *Etienne Rivière, Guillaume Rosinosky and Raziel Carvajal-Gómez*

This tutorial will guide you through the technologies and necessary tools to run the front-end.
The provided version uses non-persistent storage to save users' data (such as credentials or cart content) in the form of JSON objects.

## Prerequisites

If you have not read the [general description](../README.md) of the project, **do it before going through this tutorial.**

## Technologies involved in this project

This section gives you a list of pointers to other tutorials you can follow to be familiar with the technology used in the project.

- Learn all you want about Javascript, the programming language of the web, with: [Eloquent Javascript](http://eloquentjavascript.net/);
  - You can also follow this [interactive tutorial](https://javascript.info/).

- Start using Node.js with [this guide](https://nodejs.org/en/docs/guides/getting-started-guide/);
- Official documentation of the [NPM package manager](https://docs.npmjs.com/)
  - We encourage you to go through (at least) the following sections:
      1. [What is npm?](https://docs.npmjs.com/getting-started/what-is-npm);
      1. [How to Install Local Packages](https://docs.npmjs.com/getting-started/installing-npm-packages-locally);
      1. [Working with package.json](https://docs.npmjs.com/getting-started/using-a-package.json).

- The front-end is based on [React](https://reactjs.org/) a Javascript framework for building dynamic web interfaces.
  - :pencil: **Note.** Start reading its [official documentation](https://reactjs.org/docs/hello-world.html), and try its [interactive tutorial](https://reactjs.org/tutorial/tutorial.html).

**Do not panic**, all these documentation may seem a lot of content but it is an investment that will reward you later.

- For instance, you will continue to write code in Javascript for the back-end development.

## Development

In the following weeks, you will adapt the provided code (front-end and back-end) to complete the requested tasks for the project. In order to have one private repository per team member, you are asked to create a copy of the course repository in your GitHub account; this is commonly knows as a *GitHub fork*. To do so, click on [this link](https://github.com/CloudLargeScale-UCLouvain/LINGI2145-2020-2021) to show the repository in your Web browser and click on the *Fork* button below your GitHub avatar.

:warning: **Important:
Only one private repository per team will be graded** and considered as deliverable for the project. Be sure to have every team member as well as the teaching assistants as contributors. These are the logins of the assistants:

- **guillaumerosinosky** - Guillaume Rosinosky
- **raziel-carvajal** - Raziel Carvajal-Gómez

### Working in your Virtual Machine (VM)

In the previous practical sessions, you set up a VM with Docker. You will use this virtual machine for the project following these recommendations:

- **Use an Integrated Development Environment (IDE)**. Add your local copy of the repository as a new project in your favorite IDE.
- **Write code from your laptop and deploy in the VM**. Once you have complete a certain functionality for the project (new source code or update), build and deploy in the VM with Docker. This will require you to share the folder that contains your repository with the VM. In VirtualBox you can create such shared folder as follows:

1. Open VirtualBox, in the user interface find out your VM and click on it.
1. Click on the **Settings** button and chose the option **Shared Folders**.
1. Create a shared folder with these steps:
  - click on **Add new shared folder**;
  - give the folder path of your GitHub repository;
  - tick the option **Auto-mount**.

1. Power-on your VM and login.

By default, VirtualBox mounts any shared folder in the directory `/media` in your VM and adds the prefix `sf_` to the name of every folder.
Only users from the group `vboxsf` can modify the content of a shared folder. You can have write access to any shared folder by adding the login **user** to the VirtualBox group as follows:

```bash
sudo adduser user vboxsf
```

To apply changes, logout with the keys *Ctrl+d*. Once you login again, we recommend you to create a symbolic link in the home directory of the account **user** as follows:

```bash
ln -s /media/sf_SHARED /home/user
```

:warning: **Recall**
to replace `SHARED` with the name of the shared folder.

:bulb: **Hint**:
We encourage you to manage your GitHub repository as well as changes in the provided source code from your laptop. And in a console to the VM, build and deploy Docker containers.

:checkered_flag: **That's it.** Now you are ready to deploy the front-end, find further instructions in [front-end tutorial](01_ProjectSetup_FrontEnd.md) to start working with the Shopping Cart Application (SCApp).
