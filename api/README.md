# PanVA API

## Project Setup
```
virtualenv --python python3 venv
source venv/bin/activate
pip install -r requirements.txt
```

## Obtain a database

The databases required for this application are not provided through this repository.


## Create .env file

See `.env.example` for available configurable variables.

```
ENV=development
DEBUG=true
TESTING=true
DB_PATH=/Users/astrid/Desktop/CSV_db_pecto
SERVER_NAME=localhost:5001
```


## Compiles and hot-reloads for development
```
python app.py
```
