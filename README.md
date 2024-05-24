# PanVA

PanVA is an interactive visualization tool for pangenomic variant analysis. 
It is developed by the Bioinformatics Group of Wageningen University & Research (WUR) and the Visualization Group of Eindhoven University of Technology (TUe), the Netherlands. 
Please cite the relevant publication(s) from the list of publications if you use PanVA in your research.

This repository contains the [Frontend code](frontend), [API code](api) and [Online Docs](online_docs) for the PanVA application.


## License

PanVA has been licensed under [GNU GENERAL PUBLIC LICENSE version 3](https://www.gnu.org/licenses/gpl-3.0.en.html).


## Documentation

Documentation is available both in this repository and online at https://panbrowse.github.io/PanVA/


## Prerequisites

In order to run the PanVA application you will need the following:

- Docker
- A database that follows the [PanVA API Data Format](api/docs/data-format.md).
- _Optional:_ A [frontend configuration file](frontend/docs/config.md).


## Running the application

To run the application, you **don't** need the code from this repository.

Using the publically available Docker image, you can start the PanVA application from anywhere using the following command:

```
docker run -p 8080:80 -v /path/to/your/data:/panva/api/data -v /path/to/your/config.json:/panva/frontend/config.json -e APACHE_UID=1000 -e APACHE_GID=1000 ghcr.io/panbrowse/panva:main
```

The application will then be available on http://localhost:8080/.


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

To run the application, you **don't** need to build the application yourself. In most cases [running the application](#running-the-application) is what you're looking for.

You can, however, build a Docker image of the application yourself.
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


## Publications
- [2023] [PanVA: Pangenomic Variant Analysis](https://ieeexplore.ieee.org/document/10143227)

