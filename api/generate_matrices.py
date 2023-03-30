import os
import pandas as pd
from dotenv import load_dotenv

from cluster_functions import load_linkage_matrix, save_linkage_matrix


# Load database path from config.
config = load_dotenv(".env")
db_path = os.environ.get("API_DB_PATH", "/panva/api/data")
homology_path = os.path.join(db_path, "homology")

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], homology_path) for x in os.walk(homology_path)][1:])
ids = ["323312818"]

for id in ids:
    print("Processing {}...".format(id))

    sequences_path = os.path.join(homology_path, id, "sequences.csv")
    linkage_matrix_path = os.path.join(homology_path, id, "linkage_matrix.npy")

    if load_linkage_matrix(linkage_matrix_path) is None:
        sequences = pd.read_csv(sequences_path)
        save_linkage_matrix(linkage_matrix_path, sequences)
