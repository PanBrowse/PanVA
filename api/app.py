from flask import Flask, Response, request, send_file, jsonify
from flask_cors import CORS
import numpy as np
import sys
import os
import json
import pandas as pd
import tanglegram as tg
from dotenv import dotenv_values
from flask_json_schema import JsonSchema

from cluster_functions import (
    create_d3_dendrogram,
    create_linkage_matrix,
    create_lv_matrix,
)

# Increase recursion limit.
# TODO: Why is this necessary? Maybe the offending code should be refactored.
sys.setrecursionlimit(1500)


# Load config from `.env` file
config = dotenv_values(".env")
db_path = config.get("DB_PATH")

# Instantiate the app.
app = Flask(__name__)
app.config.update(**config)

# Enable CORS.
CORS(app)

# Enable JSON Schema validation.
schema = JsonSchema(app)


@app.route("/homology_ids")
def homology_ids():
    return send_file(os.path.join(db_path, "data_homology_ids.json"))


@app.route("/core_snp")
def core_snp():
    return send_file(os.path.join(db_path, "core_snp.txt"))


@app.route("/<id>/al_pos")
def aligned_positions(id):
    return send_file(os.path.join(db_path, id, "al_pos.csv"))


@app.route("/<id>/sequences")
def sequences(id):
    return send_file(os.path.join(db_path, id, "sequences.csv"))


@app.route("/<id>/phenos")
def phenos(id):
    # NOTE: `phenos.csv` does not contain `mRNA_id` column in CSV_db_pecto.
    # Please run `pecto_phenos_mrna` to add the column from `sequence_info.csv` into `phenos.csv`.
    # CSV_db_arabid_small does contain an `mRNA_id` column.
    return send_file(os.path.join(db_path, id, "phenos.csv"))


@app.route("/<id>/var_pos_count")
def var_pos_count(id):
    var_pos_count = pd.read_csv(os.path.join(db_path, id, "var_pos_count.csv"))
    var_pos_count["conservation"] = var_pos_count[["A", "C", "T", "G", "gap"]].max(
        axis=1
    )
    return var_pos_count.to_csv(index=False)


@app.route("/<id>/nuc_structure", methods=["GET"])
def nuc_structure(id):
    csv_path = os.path.join(db_path, id, "nuc_structure.csv")
    if not os.path.isfile(csv_path):
        return Response(status=204)
    return send_file(csv_path)


@app.route("/<id>/d3dendro", methods=["GET", "POST"])
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
def get_d3_dendro(id):
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

    return create_d3_dendrogram(linkage_matrix, data_labels)


# TODO: The routes below don't seem to be in use. Can we remove them?


@app.route("/tree_nuc_trimmed/<id>", methods=["GET"])
def trees():
    data = json.load(os.path.join(db_path, id, "trees.json"))
    return jsonify(data["nuc_trimmed"])


@app.route("/<id>/al_pos/<int:start>-<int:end>")
def aligned_positions_slice(id, start, end):
    al_pos = pd.read_csv(os.path.join(db_path, id, "al_pos.csv"))
    al_pos_small = al_pos[(start < al_pos["position"]) & (al_pos["position"] < end)]
    return al_pos_small.to_csv(index=False)


@app.route("/<id>")
def homology(id):
    return send_file(os.path.join(db_path, "{}.json".format(id)))


if __name__ == "__main__":
    app.run()
