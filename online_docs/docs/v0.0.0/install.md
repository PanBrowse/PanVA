# Installation <Badge type="info" text="v0.0.0" />


<!-- ::: warning IMPORTANT
Please refer to [this short tutorial](./tutorial-pt1-yeast.md) to test the PanVA installation
:::  -->

## Prerequisites

In order to run the PanVA application you will need the following:

- [Docker](https://docs.docker.com)
- A database that follows the [PanVA API Data Format](./data-format.md)
- _Optional:_ A [frontend configuration file](./config.md#example-configuration-file-example-config). 

## Running PanVA with Docker <Badge type="tip" text="recommended" />

Using the publically available Docker image, you can start the PanVA application from anywhere using the following command:

```
docker run -p 8080:80 -v /path/to/your/data:/panva/api/data -v /path/to/your/config.json:/panva/frontend/config.json -e APACHE_UID=1000 -e APACHE_GID=1000 ghcr.io/panbrowse/panva:main
```

The application will then be available on [http://localhost:8080/](http://localhost:8080/).
::: tip
Ensure Docker is running and has access to data directories before running the command.
:::




We'll explain the various options passed to Docker:

| <div style="width:230px">option</div>                                             | explanation                                                                                                                                                                                                                                                                                                                            |
|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-p 8080:80`                                                                      | The image exposes port 80. This option maps that port to port 8080 on the host machine.                                                                                                                                                                                                                                                |
| `-v /path/to/your/data:`<br>`/panva/api/data`                                     | Mounts your custom data directory to the predefined path `/panva/api/data` that the application looks at. <br> **Note:** Make sure this directory is writable so the [linkage_matrix.npy](data-format-homology.md#linkage_matrixnpy-auto-generated) files can be stored in each homology group directory.                              |
| (OPTIONAL) <br> `-v /path/to/your/config.json:` <br>`/panva/frontend/config.json` | Mounts your custom `config.json` file to the predefined path `/panva/frontend/config.json` that the application looks at. <br> **Note:** The `apiUrl` option should be omitted in most cases.                                                                                                                                          |
| (OPTIONAL) <br> `-e APACHE_UID=1000` <br> `-e APACHE_GID=1000`                    | The data directory mounted at `/panva/api/data` needs to be read by the Apache webserver. To prevent permission issues, the user id (uid) and group id (gid) of the user running Apache can be changed to match the data directory on the host machine. Use `ls -n` to see the numeric uid and gid of a directory on the host machine. |
| (OPTIONAL) <br> `--name panva_instance`                                           | Sets a name for your container. If not specified, the container gets a random name that is visible in Docker Desktop.                                                                                                                                                                                                                  |

## Building the application

::: warning 
For most use cases, building a custom docker image is not needed
:::

To run the application, you **don't** need to build the application yourself. In most cases [running the application](#running-the-application-with-docker) via the public Docker image is what you're looking for.

You can, however, build a Docker image of the application yourself.
From the root of this repository run the following command:

```
docker build -t panva .
```

When running the application, instead of using the provided Docker image name you use the `panva` tag instead:

```
docker run [options] panva
```

::: tip 
More information for development can be found [here](./dev-setup.md)
:::