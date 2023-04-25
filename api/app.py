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
    matrix_path_proteins = os.path.join(db_path, "geneSet", "protein_distance_matrix_cdf1_5.npy")
    matrix_path_order = os.path.join(db_path, "geneSet", "order_distance_matrix_cdf1_5.npy")
    matrix_path_orientation = os.path.join(db_path, "geneSet", "orientation_distance_matrix_cdf1_5.npy")
    matrix_path_size = os.path.join(db_path, "geneSet", "size_distance_matrix_cdf1_5.npy")
    matrix_path_location = os.path.join(db_path, "geneSet", "location_distance_matrix_cdf1_5.npy")
    matrix_path_jaccard = os.path.join(db_path, "geneSet", "jaccard_distance_matrix_cdf1_5.npy")

    # Load sequences data.
    sequences = pd.read_csv(sequences_path)
    labels = sequences["sequence_id"].to_list()

    # Load data matrix
    data_matrix_proteins = np.load(matrix_path_proteins)
    data_matrix_order = np.load(matrix_path_order)
    data_matrix_orientation = np.load(matrix_path_orientation)
    data_matrix_size = np.load(matrix_path_size)
    data_matrix_location = np.load(matrix_path_location)
    data_matrix_jaccard = np.load(matrix_path_jaccard)
    
    
    # Create linkage matrix
    linkage_matrix = create_linkage_matrix(data_matrix_proteins, "ward")
    
    if request.method == "POST":

        # get scores and multiply with matrices
        protein_score = request.json["proteinScore"]/100
        order_score = request.json["orderScore"]/100
        orientation_score = request.json["orientationScore"]/100
        size_score = request.json["sizeScore"]/100
        location_score = request.json["locationScore"]/100
        jaccard_score = request.json["jaccardScore"]/100
        print('proteinScore', protein_score)
        print('orderScore', order_score)
        print('orientationScore', orientation_score)
        print('sizeScore', size_score)
        print('locationScore', location_score)
        print('jaccardScore', jaccard_score)

        matrix_proteins = protein_score * data_matrix_proteins
        matrix_order = order_score * data_matrix_order
        matrix_orientation = orientation_score * data_matrix_orientation
        matrix_size = size_score * data_matrix_size
        matrix_location = location_score * data_matrix_location
        matrix_jaccard = jaccard_score * data_matrix_jaccard
        


        list_matrices = [matrix_proteins, matrix_order, matrix_orientation, matrix_size, matrix_location, matrix_jaccard]

        matrix_combined = np.sum(list_matrices, axis=0)
        

        method = request.json["method"]
        methods = ["average", "complete", "single", "ward"]
        if method == None:
            linkage_method = "ward"
        else:
            linkage_method = methods[method]
        print("method", methods[method])

        # Create linkage matrix
        linkage_matrix = create_linkage_matrix(matrix_combined,  linkage_method)

    # Load linkage matrix
    sorting_dict = get_clustering_leaves(sequences, linkage_matrix, labels)


    json_object = json.dumps(sorting_dict, indent = 4) 

    return jsonify(sorting_dict)


if __name__ == "__main__":
    app.run()
