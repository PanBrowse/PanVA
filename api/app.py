from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from flask_json_schema import JsonSchema

from cluster_functions import (
    create_dendrogram,
    filtered_linkage_matrix,
    load_linkage_matrix,
    save_linkage_matrix,
    create_linkage_matrix,
    get_clustering_leaves
)

# Dendrogram can be very deep.
# Default recursion depth (1000) is hit when encoding to JSON.
sys.setrecursionlimit(2500)

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

#### new route geneSets ####
@app.route("/geneSet/clustering.json", methods=["GET", "POST"])
def get_clustering_order():

    sequences_path = os.path.join(db_path, "geneSet", "sequences.csv")
    # matrix_path = os.path.join(db_path, "geneSet", "protein_distance_matrix.npy")
    matrix_path = os.path.join(db_path, "geneSet", "protein_distance_matrix_cdf1_5.npy")

    # Load sequences data.
    sequences = pd.read_csv(sequences_path)
    labels = sequences["sequence_id"].to_list()

    # Load data matrix
    data_matrix_proteins = np.load(matrix_path)

    
    # Create linkage matrix
    linkage_matrix = create_linkage_matrix(data_matrix_proteins, "average")
    
    if request.method == "POST":
        method = request.json["method"]
        methods = ["average", "complete", "single", "ward"]
        if method == None:
            linkage_method = "ward"
        else:
            linkage_method = methods[method]
        print("method", methods[method])

        # Create linkage matrix
        linkage_matrix = create_linkage_matrix(data_matrix_proteins,  linkage_method)

    # Load linkage matrix
    sorting_dict = get_clustering_leaves(sequences, linkage_matrix, labels)


    json_object = json.dumps(sorting_dict, indent = 4) 

    return jsonify(sorting_dict)


if __name__ == "__main__":
    app.run()
