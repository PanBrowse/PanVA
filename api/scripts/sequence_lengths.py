import os
import pandas as pd


db_path = "/home/folkert/coding/wur/databases/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))
    sequences_path = os.path.join(db_path, id, "sequences.csv")

    # Skip if csv is missing.
    if not os.path.isfile(sequences_path):
        continue

    sequences = pd.read_csv(sequences_path)

    lengths = len(sequences["nuc_trimmed_seq"][0])

    print(lengths)
