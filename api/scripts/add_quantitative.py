import os
import pandas as pd
import numpy as np


db_path = "/home/folkert/coding/wur/databases/CSV_db_pecto"

# Look up ids in database.
ids = sorted([os.path.relpath(x[0], db_path) for x in os.walk(db_path)][1:])


def random_values(size):
    values = list(map(lambda x: str(x), np.random.randint(0, 80, size=size)))

    # Clear around 10%
    index_to_clear = np.random.randint(0, size, size=size // 10)

    for index in index_to_clear:
        values[index] = None

    return values


for id in ids:
    print("Processing {}...".format(id))
    metadata_path = os.path.join(db_path, id, "metadata.csv")

    # Skip if csv is missing.
    if not os.path.isfile(metadata_path):
        continue

    metadata = pd.read_csv(metadata_path)

    metadata["growth_rate"] = random_values(len(metadata))

    metadata.to_csv(metadata_path, index=False)
