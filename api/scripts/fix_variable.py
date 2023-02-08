import os
import pandas as pd


db_path = "/home/folkert/coding/wur/databases/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])

for id in ids:
    print("Processing {}...".format(id))
    variable_path = os.path.join(db_path, id, "variable.csv")

    # Skip if csv is missing.
    if not os.path.isfile(variable_path):
        continue

    variable = pd.read_csv(variable_path)

    variable.drop("other", inplace=True, axis=1)
    variable["pheno_specific"] = variable["informative"]

    variable.to_csv(variable_path, index=False)
