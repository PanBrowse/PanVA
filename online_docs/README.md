# PanVA Online Docs

This directory contains all the files for the online documentation at https://panbrowse.github.io/PanVA/.

## Project Setup

We use [nvm](https://github.com/nvm-sh/nvm) to use a specific node version when developing.

```sh
nvm install
nvm use
npm ci
```

When nvm is installed correctly, the version defined in [`.nvmrc`](./.nvmrc) should be automatically loaded when a terminal is opened in the `online_docs` directory. If not, you need to run `nvm use` before running `npm` commands.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Local Preview

```sh
npm run build
npm run preview
```
