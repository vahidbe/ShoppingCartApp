
# :books: Required software for the Cloud Computing course

**LINGI2145 Autumn, 2020** -- *Etienne Rivière, Guillaume Rosinosky and Raziel Carvajal-Gómez*

# Overview

We use [VirtualBox](https://www.virtualbox.org/) as hosted hypervisor for virtualization.
Follow the instructions below to install VirtualBox, depending on the Operating System running on your laptop.

:bulb:
For further details or to solve any issue with the installation, consult the official documentation ([click here](https://www.virtualbox.org/manual/ch02.html)).

## Linux / MacOS

- [GNU/Linux based host](https://www.virtualbox.org/wiki/Linux_Downloads) (such as Debian, Ubuntu, Fedora, others);
- [OS X host](https://www.virtualbox.org/wiki/Downloads).

## Windows 10

Follow the instructions below:

1. Download VirtualBox for Windows clicking on [this link](https://download.virtualbox.org/virtualbox/6.1.14/VirtualBox-6.1.14-140239-Win.exe);

1. Follow the instructions on the executable file and chose **Default Configuration**.

Once the installation is complete you should extend the `PATH` environment variable with the installation directory of VirtualBox. To do so, follow these instructions:

1. Press the Windows key and type *environment*;
1. An option "Edit the system environment variables" should be displayed; click *Enter*; a pop-up window will be shown.
1. Click on the *Environment Variables...* button; a new pop-up window will be shown.
1. Select the *Path* environment variable from the user variables section, then click *Edit*.
1. In the (last) pop-up window, click on *New* and then add the full path to the VirtualBox installation directory (e.g.: C:\Program Files\Oracle\VirtualBox).
1. Click *OK* on all (3) pop-up windows.
