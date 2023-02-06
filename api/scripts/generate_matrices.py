import os
import pandas as pd
from dotenv import dotenv_values

from api.cluster_functions import create_lv_matrix, create_linkage_matrix

# Load database path from config.
config = dotenv_values(".env")
db_path = config.get("DB_PATH")

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))

    csv_path = os.path.join(db_path, id, "sequences.csv")
    npy_path = os.path.join(db_path, id, "linkage_matrix.npy")

    # Skip if npy file already exists, or if csv is missing.
    if not os.path.isfile(csv_path) or os.path.isfile(npy_path):
        continue

    data_sequences = pd.read_csv(csv_path)
    data_labels = data_sequences["mRNA_id"].to_list()

    data_matrix = create_lv_matrix(
        data_sequences,
        list(range(1, len(data_sequences["nuc_trimmed_seq"][0]) + 1)),
    )

    create_linkage_matrix(data_matrix, npy_path)
