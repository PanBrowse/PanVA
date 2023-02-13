# Frontend

The frontend is written in Vue (Typescript) and compiled to a static Vue application (HTML, JavaScript and CSS) using Vite. Deploying the application can be done using any webserver.

The application state, including data that is fetched from the API, is stored in a Pinia data store.

The visualizations are drawn using SVG with D3. The UI components are from the Ant Design library.


# API

The API is a Flask application written in Python. It requires a WSGI server to be deployed.


# Docker

The provided Dockerfile compiles the Frontend and configures Apache to serve both the static Frontend and the API through Apache's `mod_wsgi` module.
