import os
import pandas as pd


db_path = "/home/folkert/coding/wur/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))
    al_pos_path = os.path.join(db_path, id, "al_pos.csv")

    # Skip if csv is missing.
    if not os.path.isfile(al_pos_path):
        continue

    al_pos = pd.read_csv(al_pos_path)

    mRNA_ids = list(al_pos["mRNA_id"].unique())
    al_pos["mRNA_index"] = al_pos["mRNA_id"].map(lambda id: mRNA_ids.index(id))

    al_pos.to_csv(al_pos_path, index=False)
