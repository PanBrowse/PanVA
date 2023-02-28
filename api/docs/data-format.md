# PanVA data format

This file provides a specification for the data format as used by the PanVA application. 

We recommend to run PanTools (<https://pantools.readthedocs.io/en/stable/>) to construct a pangenome database and run functionality to obtain homology groups, sequence alignments, annotations and metadata. We support this format and are currently working on a pipeline to preprocess the PanTools data such that it is formatted correctly for PanVA. More information about this pipeline will be released soon. However, it may be possible to obtain the analysis data using other software if the output can be transformed to the format required for PanVA.

Below we describe the data directory structure and the file names, formats, and data features of the files inside those directories.

## Data directory structure 

The root data directory contains files containing data regarding the full dataset.

Each homology group is a subdirectory of the root data directory and has a unique name, corresponding to the `homology_id` identifier in `homologies.json`, and contains the files belonging to that homology group.

```
/
|-- homologies.json
|-- [tree files]
|
+-- <homology_id>/
    |-- alignments.csv
    |-- sequences.csv
    |-- variable.csv
    |-- annotations.csv     (optional)
    |-- metadata.csv        (optional)
    |-- linkage_matrix.npy  (auto-generated)
```


## Root dataset files

### `homologies.json`

A list of objects representing all homology ids of the selected set. Homology id objects have the following properties:

* `homology_id`: Unique id for the homology group (_integer_).
* `name`: Name of the gene (**optional** _string_).
* `members`: Number of sequences (_integer_).
* `alignment_length`: Length of the alignment (_integer_).
* `metadata`: Metadata shown in the frontend (**optional** _array_). Each containing:
    * `label`: Label to display (_string_).
    * `value`: Value to display (_string|boolean_).

An example object in the array:
```json
[
    {
        "homology_id": 13773385,
        "name": "GapA",
        "members": 197,
        "alignment_length": 996,
        "metadata": [
            { "label": "Classification", "value": "single copy core" },
            { "label": "Variable sites", "value": true },
            { "label": "Informative sites", "value": false }
        ]
    }
]
```

### `tree files` (OPTIONAL)

The PanVA frontend can be configured to display one or more additional trees, such as CoreSNP. The files are in Newick format and should be placed in the root directory of the dataset.


## Homology group files

#### `alignments.csv`

This is a matrix of the aligned gene sequences and position specific attributes. For example:

| `mRNA_id`                | `genome_nr` | `position` | `nucleotide` |
|--------------------------|-------------|------------|--------------|
| 97_1_FEDMPDKE_03607_mRNA | 97          | 1          | A            |
| 97_1_FEDMPDKE_03607_mRNA | 97          | 2          | T            |

* `mRNA_id`: A unique identifier for each sequence in the homology group (_string_).
* `genome_nr`: A unique ID for each genome sequence (_integer_).
* `position`: The position in the alignment (_integer_).
* `nucleotide`: The nucleotide value (_`A|C|G|T|-`_).

This file can be extended with [additional metadata](#additionalmetadata).


### `sequences.csv`

The sequences extracted from the multiple sequence alignment. This file is used to generate dendrograms. For example:

| `mRNA_id`                | `nuc_trimmed_seq`                                         |
|--------------------------|-----------------------------------------------------------|
| 97_1_FEDMPDKE_03607_mRNA | ATGAGTTTTGATAATTCCCCACAATCACGCCTGATCCTAACCATGATGGGAGCC... |
| 87_1_JABOGBIO_03490_mRNA | ATGAGTTTTGATAATTCCCCACAATCACGCCTGATCCTAACCATGATGGGAGCC... |

* `mRNA_id`: A unique identifier for each sequence in the homology group (_string_).
* `nuc_trimmed_seq`: The nucleotide sequences, trimmed in PanTools (_string_).


### `variable.csv`

Summary of all variable positions in the alignment and their value counts. This data is used for calculation of the conservation score at each aligned position. For example:

| `position` | `informative` | `A` | `C` | `G` | `T` | `gap` | `pheno_specific` |
|------------|---------------|-----|-----|-----|-----|-------|------------------|
| 1          | True          | 0   | 30  | 70  | 0   | 0     | True             |
| 9          | False         | 1   | 0   | 70  | 99  | 0     | False            |

* `position`: The position in the alignment (_integer_).
* `informative`: Is position informative in nucleotide alignment (_boolean_).
* `A`: Number of sequences containing nucleotide A (_integer_).
* `C`: Number of sequences containing nucleotide C (_integer_).
* `G`: Number of sequences containing nucleotide G (_integer_).
* `T`: Number of sequences containing nucleotide T (_integer_).
* `gap`: Number of sequences containing a gap (-) (_integer_).

This file can be extended with [additional metadata](#additionalmetadata).


### `annotations.csv` (OPTIONAL)

This optional file is only used for Eukaryotic pangenomes. It specifies the gene models matched to each gene sequences of reference genomes (for which GFF files are available). For example:

| `mRNA_id`           | `position` | `cds` | `exon` |
|---------------------|------------|-------|--------|
| 5_1_ATERI-1G45130.1 | 1          | True  | False  |
| 5_1_ATERI-1G45130.2 | 1          | False | False  |

* `mRNA_id`: A unique identifier for each sequence in the homology group (_string_).
* `position`: The position in the alignment (_integer_).

This file can be extended with [additional metadata](#additionalmetadata).

This file can be extended with additional columns to be used as annotations. For example:

* `cds`: Does position have this feature in nucleotide alignment (_boolean_).
* `exon`: Does position have this feature in nucleotide alignment (_boolean_).

The frontend needs to be [configured](../../frontend/docs/config.md) to display these annotations.


### `metadata.csv` (OPTIONAL)

An optional CSV file containing metadata for each genome indicated by `mRNA_id` that should be included in the analysis. For example: 

| `mRNA_id`                | `virulence` | `species`     |
|--------------------------|-------------|---------------|
| 97_1_FEDMPDKE_03607_mRNA | avirulent   | P.brasiliens  |
| 87_1_JABOGBIO_03490_mRNA | ?           | P.brasiliense |

* `mRNA_id`: A unique identifier for each sequence in the homology group (_string_).

This file can be extended with [additional metadata](#additionalmetadata).


### `linkage_matrix.npy` (AUTO-GENERATED)

The linkage matrix for generating the initial clustering dendrogram, stored as NumPy file. This file is generated once by the API and is used to improve application performance.

**Important:** Please delete this file if the contents of `sequences.csv` has changed.


## Additional metadata

Some files, specifically [`alignments.csv`](#alignmentscsv), [`metadata.csv`](#metadatacsv), and [`variable.csv`](#variablecsv), can be extended with additional metadata columns.
Values in each column should be of the same type (string, number, optional boolean).

The frontend needs to be [configured](../../frontend/docs/config.md) to use these additional columns.
