# PanVA API

## Install Poetry

```
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
poetry config virtualenvs.in-project true # For linters to work with VSCode
```

## Install project dependencies

```
poetry install
```

## Run the application

```
poetry run python app.py
```

The application will then be available on http://localhost:5001/.
