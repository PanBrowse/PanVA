#!/app/api/venv/bin/python
import sys
import os
import logging

# Redirect python logging to stderr.
logging.basicConfig(stream=sys.stderr)

# Include app directory in module search paths.
sys.path.insert(0, "/app/api/code")

# Configure environment variables for Docker.
os.environ["API_DB_PATH"] = "/panva/api/data"

from app import app as application
