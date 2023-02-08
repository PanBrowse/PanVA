from flask import Flask, Response, request, send_file, jsonify
from flask_cors import CORS
import numpy as np
import sys
import os
import json
import pandas as pd
import tanglegram as tg
from dotenv import load_dotenv
from flask_json_schema import JsonSchema

from cluster_functions import (
    create_dendrogram,
    create_linkage_matrix,
    create_lv_matrix,
)

# Increase recursion limit.
# TODO: Why is this necessary? Maybe the offending code should be refactored.
sys.setrecursionlimit(1500)

# Load config from `.env` file into environment variables.
load_dotenv(".env")

# Get non-Flask configuration options from environment variables.
db_path = os.environ.get("API_DB_PATH")

# Instantiate the app.
app = Flask(__name__)

# Load Flask configuration options from environment variables (prefixed with API_).
app.config.from_prefixed_env("API")

# Enable CORS.
CORS(app)

# Enable JSON Schema validation.
schema = JsonSchema(app)


@app.route("/homologies.json")
def homology_ids():
    return send_file(os.path.join(db_path, "homologies.json"))


@app.route("/core_snp.txt")
def core_snp():
    return send_file(os.path.join(db_path, "core_snp.txt"))


@app.route("/<id>/alignments.csv")
def alignment(id):
    return send_file(os.path.join(db_path, id, "alignments.csv"))


@app.route("/<id>/phenos.csv")
def phenos(id):
    return send_file(os.path.join(db_path, id, "phenos.csv"))


@app.route("/<id>/variable.csv")
def var_pos_count(id):
    return send_file(os.path.join(db_path, id, "variable.csv"))


@app.route("/<id>/annotations.csv", methods=["GET"])
def annotations(id):
    return send_file(os.path.join(db_path, id, "annotations.csv"))


@app.route("/<id>/dendrogram.json", methods=["GET", "POST"])
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
    data_sequences = pd.read_csv(os.path.join(db_path, id, "sequences.csv"))
    linkage_matrix = np.load(os.path.join(db_path, id, "linkage_matrix.npy"))

    data_labels = data_sequences["mRNA_id"].to_list()

    if request.method == "POST":
        positions = request.json["positions"]

        selected_data_matrix = create_lv_matrix(data_sequences, positions)
        selected_linkage_matrix = create_linkage_matrix(selected_data_matrix)

        untangled = tg.untangle(
            selected_linkage_matrix,
            linkage_matrix,
            data_labels,
            data_labels,
            method="step1side",
        )

        linkage_matrix = untangled[0]

    return create_dendrogram(linkage_matrix, data_labels)


if __name__ == "__main__":
    app.run()
