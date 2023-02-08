import os
import pandas as pd


db_path = "/home/folkert/coding/wur/databases/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))
    alignment_path = os.path.join(db_path, id, "alignment.csv")

    # Skip if csv is missing.
    if not os.path.isfile(alignment_path):
        continue

    alignment = pd.read_csv(alignment_path)

    alignment.drop("index", inplace=True, axis=1)
    alignment.drop("variable", inplace=True, axis=1)
    alignment.drop("virulence", inplace=True, axis=1)
    alignment.drop("informative", inplace=True, axis=1)
    alignment.drop("pheno_specific", inplace=True, axis=1)
    alignment.drop("mRNA_index", inplace=True, axis=1)

    alignment.to_csv(alignment_path, index=False)
