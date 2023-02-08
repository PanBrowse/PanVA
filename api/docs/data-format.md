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
|-- core_snp.txt
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
* `name`: Name of the gene (_string_).
* `members`: Number of sequences (_integer_).
* `gene_length`: Length of the gene (_integer_).
* `class`: Homology classification (_string_).
* `variable_sites_nuc`: Presence of any variable positions in nucleotide alignment (_boolean_).
* `variable_sites_prot`: Presence of any informative positions in protein alignment (_boolean_).
* `informative_sites_nuc`: Presence of any informative positions in nucleotide alignment (_boolean_).
* `informative_sites_prot`: Presence of any informative positions in protein alignment (_boolean_).
* `pheno_specific_changes_nuc`: Presence of any phenotype specific positions in nucleotide alignment for a predefined phenotype (_boolean_).
* `pheno_specific_changes_prot`: Presence of any phenotype specific positions in protein alignment for a predefined phenotype (_boolean_).

An example object in the array:
```json
[
    {
        "homology_id": 13773385,
        "name": "GapA",
        "members": 197,
        "gene_length": 996,
        "class": "single copy core",
        "variable_sites_nuc": true,
        "variable_sites_prot": true,
        "informative_sites_nuc": true,
        "informative_sites_prot": true,
        "pheno_specific_changes_nuc": true,
        "pheno_specific_changes_prot": true
    }
]
```


### `core_snp.txt`

A Maximum likelihood (ML) or Neighbour-Joining (NJ) phylogeny from SNPs identified from single copy orthologous genes. The file is in Newick format. 


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

This file can be extended with additional columns to be used as a position filter. For example:

* `pheno_specific`: Is position phenotype specific in nucleotide alignment (_boolean_).

The frontend needs to be [configured](../../frontend/docs/config.md) to filter on these additional columns.


### `annotations.csv` (OPTIONAL)

This optional file is only used for Eukaryotic pangenomes. It specifies the gene models matched to each gene sequences of reference genomes (for which GFF files are available). For example:

| `mRNA_id`           | `position` | `feature` |
|---------------------|------------|-----------|
| 5_1_ATERI-1G45130.1 | 1          | cds       |
| 5_1_ATERI-1G45130.2 | 1          | cds       |

* `mRNA_id`: A unique identifier for each sequence in the homology group (_string_).
* `position`: The position in the alignment (_integer_).
* `feature`: Is position in the coding regions (cds) (_boolean_).


### `metadata.csv` (OPTIONAL)

An optional CSV file containing metadata for each genome indicated by `mRNA_id` that should be included in the analysis. For example: 

| `mRNA_id`                | `virulence` | `species`     |
|--------------------------|-------------|---------------|
| 97_1_FEDMPDKE_03607_mRNA | avirulent   | P.brasiliens  |
| 87_1_JABOGBIO_03490_mRNA | ?           | P.brasiliense |

* `mRNA_id`: A unique identifier for each sequence in the homology group (_string_).

This file can be extended with additional columns to be shown as metadata. For example:

* `virulence`: Example binary metadata, in this case virulence (_boolean_).
* `species`: Example categorical metadata, in this case the species name (_string_).

The frontend needs to be [configured](../../frontend/docs/config.md) to display this metadata.


### `linkage_matrix.npy` (AUTO-GENERATED)

The linkage matrix for generating the initial clustering dendrogram, stored as NumPy file. This file is generated once by the API and is used to improve application performance.


