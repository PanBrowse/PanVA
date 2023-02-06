# PanVA

This repository contains both the [Frontend code](frontend) and the [API code](api) for the PanVA application.


## Prerequisites

In order to run the PanVA application you will need the following:

- Docker
- A database that follows the [PanVA API Data Format](api/docs/data-format.md).
- _Optional:_ A [frontend configuration file](frontend/docs/config.md).


## Running the application

To run the application, you **don't** need the code from this repository.

Using the publically available Docker image (NOT YET AVAILABLE), you can start the PanVA application from anywhere using the following command:

```
docker run -p 8080:80 -v /path/to/your/data:/panva/api/data -v /path/to/your/config.json:/panva/frontend/config.json pantools/panva
```

The application will then be available on http://localhost:8080/.


We'll explain the various options passed to Docker.

- `-p 8080:80`
  The image exposes port 80. This option maps that port to port 8080 on the host machine.
- `-v /path/to/your/data:/panva/api/data`
  Mounts your custom data directory to the predefined path `/panva/api/data` that the application looks at.
- `-v /path/to/your/config.json:/panva/frontend/config.json`
  Mounts your optional custom `config.json` file to the predefined path `/panva/frontend/config.json` that the application looks at.


## Building the application

Instead of using the provided Docker images (NOT YET AVAILABLE), you can build a Docker image of the application yourself.

From the root of this repository run the following command:

```
docker build -t panva .
```

When running the application, instead of using the provided Docker image name you use the `panva` tag instead:

```
docker run [options] panva
```


## Without docker

Running the application without Docker is possible, but is not documented.
