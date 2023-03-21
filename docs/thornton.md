This document describes how to manage PanVA instances to be available through https://www.bioinformatics.nl/panva/.

# Introduction

When a user visits https://www.bioinformatics.nl/panva/ or any subpage, the request is forwarded by Myers (the public webserver) to Thornton (an internal server that runs docker containers).
On Thornton, each request is handled by a single Nginx instance that forwards the request to the appropriate PanVA instance based on the subpath.

Adding new PanVA instances requires no changes on Myers.


# Configuration files

There are two main configuration files that need to change when instances are added or removed.

## `docker-compose.yml`

```yaml
version: "3.4"

services:
  nginx:
    image: nginx
    restart: always
    volumes:
      - /home/vries490/panva/panva.conf:/etc/nginx/conf.d/default.conf
      - /home/vries490/panva/htpasswd:/etc/nginx/htpasswd
    ports:
      - 6455:80

  pecto205:
    image: ghcr.io/panbrowse/panva:main
    restart: always
    environment:
      APACHE_UID: 17542368 # vlugt012
      APACHE_GID: 16777729 # domain users
    volumes:
      - /lustre/BIF/nobackup/vlugt012/pecto_454_genomes_panva_205hom/panva_inputs_v4:/panva/api/data
      - /home/vries490/panva/pecto205.json:/panva/frontend/config.json

  pecto454:
    image: ghcr.io/panbrowse/panva:main
    restart: always
    environment:
      APACHE_UID: 17591786 # vries490
      APACHE_GID: 16777729 # domain users
    volumes:
      - /lustre/BIF/nobackup/vries490/pecto_454_genomes_panva/panva_inputs_v3:/panva/api/data
      - /home/vries490/panva/pecto454.json:/panva/frontend/config.json
```

This file contains all docker containers that should be running. One for Nginx, and one for each PanVA instance.

The first container called `nginx` is the entrypoint for all http requests for _all_ PanVA instances.

The second and third containers called `pecto205` and `pecto454` are PanVA instances. Consult [this repository's README](../README.md#running-the-application) on how an instance should be configured. Setting the correct `APACHE_UID` and `APACHE_GID` is very important.


## `panva.conf`

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name localhost;

  # gzip is disabled by default.
  gzip on;
  # By default only mimetype text/html is gzipped.
  gzip_types text/plain text/csv application/json;

  location / {
    default_type text/html;
    return 200 "Please include an instance name in the url.";
  }

  location /pecto-205/ {
    auth_basic "Please authenticate";
    auth_basic_user_file /etc/nginx/htpasswd/pecto205.htpasswd;

    proxy_pass http://pecto205/;
  }

  location /pecto-454/ {
    proxy_pass http://pecto454/;
  }
}
```

This is the Nginx configuration file and contains routing for each PanVA instance. In this case, we have two instances configured:

* The path `/pecto-205/` (accessible through https://www.bioinformatics.nl/panva/pecto-205/) is routed to the `pecto205` instance configured in [`docker-compose.yml`](#docker-composeyml).
  It is also configured to require authentication using `auth_basic` and `auth_basic_user_file`.
* The path `/pecto-454/` (accessible through https://www.bioinformatics.nl/panva/pecto-454/) is routed to the `pecto454` instance configured in [`docker-compose.yml`](#docker-composeyml).
  It will be publicly available without requiring authentication.


## Authentication

Each instance can be configured to require a user to authenticate before the instance (and more importantly its data) can be viewed. The `htpasswd` file referenced by `auth_basic_user_file` contains a line for each user:

```
alice:$apr1$.I8RXGAo$4QcBIQtX5hA6oCJNyGSsu.
bob:$apr1$YRIshvy/$TBYQ8WvEyGSWJDqBoM96E0
```

Each line is in the format `username:hash` where the hash can be generated using `openssl passwd -apr1`

**Important:** Use a separate `htpasswd` file for each instance, to prevent users from being able to access other instances.


# Updating instances

Whenever you have made changes in the configuration files, or if a new docker image needs to be deployed, you need to run the following commands from the directory where `docker-compose.yml` is located:

```shell
docker-compose pull
docker-compose up -d --remove-orphans
```

The first command will pull the latest versions of all used images from their respective container registries.
The second command will update running containers to use the newer images, start up new instances, and stop old instances.

If you want to change the running instances without updating to the latest version, only run the second command.


# Notes

At the time of writing, the PanVA configuration is located in `/home/vries490/panva`. This should be changed to a more generic directory outside of a specific user's homedir. That directory should be writable by a new group containing all users that need to manage PanVA.
