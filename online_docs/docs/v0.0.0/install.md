# Installation <Badge type="info" text="v0.0.0" />

This page contains instructions on how to get started with PanVA using your own data.

## Prerequisites

In order to run the PanVA application you will need the following:

- [Docker](https://docs.docker.com)
- A database that follows the [PanVA API Data Format](./data-format.md)
- _Optional:_ A [frontend configuration file](./config.md#example-configuration-file-example-config)

## Running the application with Docker <Badge type="tip" text="recommended" />

Using the publically available Docker image, you can start the PanVA application from anywhere using the following command:

```
docker run -p 8080:80 -v /path/to/your/data:/panva/api/data -v /path/to/your/config.json:/panva/frontend/config.json -e APACHE_UID=1000 -e APACHE_GID=1000 ghcr.io/panbrowse/panva:main
```

The application will then be available on [http://localhost:8080/](http://localhost:8080/).
::: tip
Ensure Docker is running and has access to data directories before running the command.
:::




We'll explain the various options passed to Docker.

- `-p 8080:80` \
  The image exposes port 80. This option maps that port to port 8080 on the host machine.
- `-v /path/to/your/data:/panva/api/data` \
  Mounts your custom data directory to the predefined path `/panva/api/data` that the application looks at. \
  **IMPORTANT:** Make sure this directory is writable so the [linkage_matrix.npy](api/docs/data-format.md#linkage_matrixnpy-auto-generated) files can be stored in each homology group directory.
- `-v /path/to/your/config.json:/panva/frontend/config.json` \
  Mounts your custom `config.json` file to the predefined path `/panva/frontend/config.json` that the application looks at. The `apiUrl` option should be omitted in most cases.
- `-e APACHE_UID=1000` \
  `-e APACHE_GID=1000` \
  The data directory mounted at `/panva/api/data` needs to be read by the Apache webserver. To prevent permission issues, the user id (uid) and group id (gid) of the user running Apache can be changed to match the data directory on the host machine. Use `ls -n` to see the numeric uid and gid of a directory on the host machine.

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

## Development installation

Running the application without Docker is possible. The PanVA source code can be found on [GitHub](https://github.com/PanBrowse/PanVA/tree/main), containing Frontend and API code. Once you have cloned the repository, use the following commands to install the frontend and API:

### Frontend
We use [nvm](https://github.com/nvm-sh/nvm) to use a specific node version when developing.

```sh
nvm install
nvm use
npm ci
```

When nvm is installed correctly, the version defined in [`.nvmrc`](./.nvmrc) should be automatically loaded when a terminal is opened in the `frontend` directory. If not, you need to run `nvm use` before running `npm` commands.

#### Compile and Hot-Reload for Development

```sh
npm run dev
```

#### Type-Check, Compile and Minify for Production

```sh
npm run build
```

#### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### API code

#### Install Poetry

```
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
poetry config virtualenvs.in-project true # For linters to work with VSCode
```

#### Install project dependencies

```
poetry install
```
#### Run the application

```
poetry run python app.py
```

The application will then be available on [http://localhost:5001/](http://localhost:5001/).

::: tip 
More information for development can be found [here](./dev-setup.md)
:::