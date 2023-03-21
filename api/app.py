from flask import Flask, request
from flask_cors import CORS
import os
import pandas as pd
from dotenv import load_dotenv
from flask_json_schema import JsonSchema

from cluster_functions import (
    create_dendrogram,
    filtered_linkage_matrix,
    load_linkage_matrix,
    save_linkage_matrix,
)

# Load config from `.env` file into environment variables.
load_dotenv(".env")

# Get non-Flask configuration options from environment variables.
db_path = os.environ.get("API_DB_PATH")

# Instantiate the app.
app = Flask(
    __name__,
    # Static files in `db_path` will be served by Flask.
    # In production, this should be handled by a webserver.
    static_url_path="",
    static_folder=db_path,
)


# Load Flask configuration options from environment variables (prefixed with API_).
app.config.from_prefixed_env("API")

# Enable CORS.
CORS(app)

# Enable JSON Schema validation.
schema = JsonSchema(app)


@app.route("/homology/<id>/dendrogram.json", methods=["GET", "POST"])
@schema.validate(
    {
        "type": "object",
        "properties": {
            "positions": {
                "type": "array",
                "items": {
                    "type": "integer",
                    "minimum": 0,
                },
            }
        },
        "required": ["positions"],
    }
)
def get_dendrogram(id):
    sequences_path = os.path.join(db_path, "homology", id, "sequences.csv")
    linkage_matrix_path = os.path.join(db_path, "homology", id, "linkage_matrix.npy")

    # Load sequences data.
    sequences = pd.read_csv(sequences_path)

    # Load linkage matrix, or create if it does not exist.
    linkage_matrix = load_linkage_matrix(linkage_matrix_path)
    if linkage_matrix is None:
        linkage_matrix = save_linkage_matrix(linkage_matrix_path, sequences)

    labels = sequences["mRNA_id"].to_list()

    # Generate custom dendrogram based on passed positions.
    if request.method == "POST":
        positions = request.json["positions"]
        linkage_matrix = filtered_linkage_matrix(
            linkage_matrix, sequences, positions, labels
        )

    return create_dendrogram(linkage_matrix, labels)


if __name__ == "__main__":
    app.run()
