# The image is built in multiple stages. This prevents instructions from
# being executed unnecessarily, but also keeps the final image size down.


# Stage 1

# Install frontend dependencies.
FROM node:18.14.0-alpine AS frontend-deps
WORKDIR /app

COPY ./frontend/patches ./patches
COPY ./frontend/package.json ./frontend/package-lock.json ./

RUN npm ci


# Stage 2

# Rebuild the source code.
FROM node:18.14.0-alpine AS frontend-builder
WORKDIR /app

COPY --from=frontend-deps /app/node_modules ./node_modules
COPY ./frontend .

RUN npm run build-only


# Stage 3

# Install api dependencies.
# Python version must match mod_wsgi python version:
#   ldd /usr/lib/apache2/modules/mod_wsgi.so
# Numpy recommends against using alpine, so using debian instead.
FROM python:3.9-slim-bullseye AS api-deps
WORKDIR /app

RUN pip install poetry

COPY ./api/pyproject.toml ./api/poetry.lock ./

RUN poetry config virtualenvs.in-project true && \
    poetry config virtualenvs.options.always-copy true && \
    poetry install --no-interaction --no-ansi --only main


# Stage 4

# Group all API files together.
FROM debian:bullseye-slim AS api-builder
WORKDIR /app

COPY ./api/app.py ./api/cluster_functions.py ./


# Stage 5

# Production image.
# Numpy is having issues with alpine, so we are using debian instead.
FROM debian:bullseye-slim

ENV DEBIAN_FRONTEND noninteractive

# Install system dependencies.
RUN apt-get update && apt-get install -y apache2 apache2-utils libapache2-mod-wsgi-py3

# Create directory structure for mounts.
RUN mkdir -p /panva/frontend
RUN mkdir -p /panva/api/data
RUN mkdir -p /app/frontend
RUN mkdir -p /app/api/code
RUN mkdir -p /app/api/venv

# Apache configuration
COPY docker/panva.conf /etc/apache2/sites-available/
RUN a2dissite 000-default default-ssl
RUN a2ensite panva

# Application code.
COPY --from=frontend-builder /app/dist /app/frontend
COPY --from=api-deps /app/.venv /app/api/venv
COPY --from=api-builder /app /app/api/code
COPY ./docker/api.wsgi /app/api/code

# Copy script to run apache in the foreground.
COPY docker/apache2-foreground /usr/local/bin/

# Output apache logs to docker.
RUN ln -sf /dev/stdout /var/log/apache2/access.log && \
    ln -sf /dev/stdout /var/log/apache2/error.log

# https://httpd.apache.org/docs/2.4/stopping.html#gracefulstop
STOPSIGNAL SIGWINCH

VOLUME "/panva/api/data"
VOLUME "/panva/frontend"

EXPOSE 80

CMD ["apache2-foreground"]
