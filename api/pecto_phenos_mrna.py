import os
import pandas as pd


# phenos.csv does not contain mRNA_id in pecto, but it does in arabid.
# Using this script we merge mRNA_id into phenos.csv so the API can remain stable.
db_path = "/home/folkert/coding/wur/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))

    phenos_path = os.path.join(db_path, id, "phenos.csv")
    seq_info_path = os.path.join(db_path, id, "sequence_info.csv")

    # Skip if either csv is missing.
    if not os.path.isfile(phenos_path) or not os.path.isfile(seq_info_path):
        continue

    phenos = pd.read_csv(phenos_path)
    seq_info = pd.read_csv(seq_info_path)
    # Only merge mRNA_id column.
    seq_info = seq_info[["genome_nr", "mRNA_id"]]
    result = pd.merge(phenos, seq_info, on=["genome_nr"])

    result.to_csv(phenos_path, index=False)
