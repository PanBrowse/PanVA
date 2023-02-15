import os
import pandas as pd
from dotenv import dotenv_values

from cluster_functions import load_linkage_matrix, save_linkage_matrix


# Load database path from config.
config = dotenv_values(".env")
db_path = config.get("API_DB_PATH")

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))

    sequences_path = os.path.join(db_path, id, "sequences.csv")
    linkage_matrix_path = os.path.join(db_path, id, "linkage_matrix.npy")

    if load_linkage_matrix(linkage_matrix_path) is None:
        sequences = pd.read_csv(sequences_path)
        save_linkage_matrix(linkage_matrix_path, sequences)
