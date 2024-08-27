# Development Guide <Badge type="info" text="v0.0.0" />

For easy installation, please follow [the instructions](./install.md) under Getting Started. 

On this page, we describe the full installation process needed for developers.
The PanVA source repository is available on [GitHub](https://github.com/PanBrowse/PanVA). After you cloned or forked the repo, please follow our recommendations below.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension for language support.

### Type Support for `.vue` Imports in TS
For Typescript support, please make sure the built-in Typescript extension is enabled (default enabled). To check this, go to the Extensions tab and type `@builtin typescript and javascript`.

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. 

In editors, we need to enable [Vue - Official extension for language support](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

::: warning
Previously, we used [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin). This extension is deprecated. Use the Vue - Official extension instead.
:::


## Frontend

We use [nvm](https://github.com/nvm-sh/nvm) to use a specific node version when developing.

```sh
nvm install
nvm use
npm ci
```

When nvm is installed correctly, the version defined in `.nvmrc` should be automatically loaded when a terminal is opened in the `frontend` directory. If not, you need to run `nvm use` before running `npm` commands.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## API code

### Install Poetry

```
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
poetry config virtualenvs.in-project true # For linters to work with VSCode
```

### Install project dependencies

```
poetry install
```
### Run the application

```
poetry run python app.py
```

The application will then be available on [http://localhost:5001/](http://localhost:5001/).
