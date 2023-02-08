import os
import pandas as pd


db_path = "/home/folkert/coding/wur/databases/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))
    phenos_path = os.path.join(db_path, id, "phenos.csv")

    # Skip if csv is missing.
    if not os.path.isfile(phenos_path):
        continue

    phenos = pd.read_csv(phenos_path)

    phenos.drop("genome_nr", inplace=True, axis=1)
    phenos.drop("pheno_node_id", inplace=True, axis=1)

    # shift column 'mRNA_id' to first position
    mRNA_id = phenos.pop("mRNA_id")
    phenos.insert(0, "mRNA_id", mRNA_id)

    phenos.to_csv(phenos_path, index=False)
