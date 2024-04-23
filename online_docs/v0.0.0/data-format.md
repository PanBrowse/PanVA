# PanVA data format <Badge type="info" text="v0.0.0" />

This file provides a specification for the data format as used by the PanVA application. 

## Data directory structure 

The root data directory contains a separate directory for each PanVA app, such as `homology` or `geneSet`.

```
/
|-- homology/
|-- geneSet/
```

The contents of each directory is defined in the respective data format document of each app:

* [Homology](./data-format-homology.md)
* [GeneSet](./data-format-geneSet.md)