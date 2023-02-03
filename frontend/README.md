# PanVA Frontend

For configuration options, please read [docs/config.md](docs/config.md).

Documentation on development can be found at [docs/development.md](docs/development.md).

## Running the application

```
docker build -t panva .
docker run -p 8080:80 -v $(pwd)/public/config.json:/usr/share/nginx/html/config.json panva
```
