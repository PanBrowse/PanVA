# Configuration

The PanVA application can be configured with a runtime configuration file `config.json` placed in the root directory of the application.

## Options

All fields are optional.

| Field                                     | Type           | Default                              | Description                                    |
|-------------------------------------------|----------------|--------------------------------------|------------------------------------------------|
| `apiUrl`                                  | `string`       | `"/api/"`                            |                                                |
| `apps`                                    | `string[]`     | `["homology"]`                       |                                                |
| `homology`                                | `object`       |                                      | Configuration options for the `homology` app.  |
| `homology.alignmentMetadata`              | `Metadata[]`   | `[]`                                 | Metadata to be displayed when hovering a cell. |
| `homology.annotations`                    | `Annotation[]` | `[]`                                 |                                                |
| `homology.defaultId`                      | `integer`      | The first id in the homologies list. |                                                |
| `homology.defaultSequenceMetadataColumns` | `string[]`     | `[]`                                 |                                                |
| `homology.homologyMetadata`               | `Metadata[]`   | `[]`                                 |                                                |
| `homology.sequenceMetadata`               | `Metadata[]`   | `[]`                                 |                                                |
| `homology.trees`                          | `Tree[]`       | `[]`                                 |                                                |
| `homology.variableMetadata`               | `Metadata[]`   | `[]`                                 |                                                |
| `title`                                   | `string`       | `"PanVA"`                            |                                                |


## Annotation

Positions can be annotated with one or more features. You can configure which annotations should be displayed.

Each column should be configured as a JSON object with the following options:

| Field    | Type     | Required           | Notes                                                                                     |
|----------|----------|--------------------|-------------------------------------------------------------------------------------------|
| `column` | `string` | :heavy_check_mark: | CSV column in [`annotations.csv`](../../api/docs/data-format.md#annotationscsv-optional). |
| `label`  | `string` | :heavy_check_mark: | Description of the annotation.                                                            |


## Tree

Besides the default and custom dendrogram, PanVA can render additional trees in Newick for. You can configure which columns should be displayed.

Each column should be configured as a JSON object with the following options:

| Field      | Type     | Notes                                                                       |
|------------|----------|-----------------------------------------------------------------------------|
| `filename` | `string` | Filename of the tree file (in Newick format) in the root dataset directory. |
| `label`    | `string` | Description of the tree.                                                    |


## Metadata

Metadata can be visualized in a number of different ways. You can configure which columns should be displayed.

Each column should be configured as a JSON object with the following options:

| Field    | Type                                           | Notes                                               |
|----------|------------------------------------------------|-----------------------------------------------------|
| `column` | `string`                                       | CSV column in the respective file (see note below). |
| `label`  | `string`                                       | Short description of the column.                    |
| `type`   | `"boolean" \| "categorical" \| "quantitative"` |                                                     |

Based on the value of `type` these options are extended with the options as defined below.

**Important:** The same metadata column can not be displayed more than once.


### Files

This type is used for several kinds of metadata, which are stored in multiple files: 

* `alignmentMetadata` is stored in [`alignments.csv`](../../api/docs/data-format.md#alignmentscsv) and contains metadata for each position in each aligned gene sequence.
* `homologyMetadata` is stored in [`homologies.json`](../../api/docs/data-format.md#homologiesjson) and contains metadata for each homology group.
* `sequenceMetadata` is stored in [`metadata.csv`](../../api/docs/data-format.md#metadatacsv) and contains metadata for each aligned gene sequence (metadata is the same for all positions).
* `variableMetadata` is stored in [`variable.csv`](../../api/docs/data-format.md#variablecsv) and contains metadata for each variable position (metadata is the same for all sequences).

Metadata of type `boolean` in `variableMetadata` can also be used to filter positions.


### Type: Boolean

| Field          | Type     | Required           | Notes                                  |
|----------------|----------|--------------------|----------------------------------------|
| `labels`       | `object` |                    | Displayed in tooltip over column.      |
| `labels.true`  | `string` | :heavy_check_mark: |                                        |
| `labels.false` | `string` | :heavy_check_mark: |                                        |
| `labels.null`  | `string` | :heavy_check_mark: |                                        |
| `values`       | `object` |                    |                                        |
| `values.true`  | `string` | :heavy_check_mark: | Consider this CSV value to be `true`.  |
| `values.false` | `string` | :heavy_check_mark: | Consider this CSV value to be `false`. |

When `values` is omitted, the value will be matched (case-insensitive) against `"true" | "t" | "yes" | "y"` for `true` and `"false" | "f" | "no" | "n"` for `false`. All other values will be considered to be unknown (`null`).


### Type: Categorical

| Field   | Type     | Default | Notes                                      |
|---------|----------|---------|--------------------------------------------|
| `width` | `number` | `120`   | Width of the column for sequence metadata. |


### Type: Quantitative

| Field      | Type     | Default                 | Notes                                                               |
|------------|----------|-------------------------|---------------------------------------------------------------------|
| `decimals` | `number` | `0`                     | Maximum number of decimals to display. Trailing zeroes are removed. |
| `maxValue` | `number` | Maximum value in column | Maximum value to determine bar width.                               |
| `suffix`   | `string` | `""`                    | String to be placed behind the numeric value (e.g. `"%"`)           |
| `width`    | `number` | `120`                   | Width of the column for sequence metadata.                          |



## Example configuration file

```json
{
  "apiUrl": "/pecto/",
  "homology": {
    "defaultId": 13803671,
    "annotations": [
      {
        "column": "cds",
        "label": "CDS"
      }
    ],
    "sequencesMetadata": [
      {
        "column": "ft16",
        "label": "FT16",
        "type": "quantitative",
        "width": 80
      },
      {
        "column": "virulence",
        "label": "Virulence",
        "labels": {
          "true": "Virulent",
          "false": "Avirulent",
          "null": "Unknown"
        },
        "type": "boolean",
        "values": {
          "true": "virulent",
          "false": "avirulent"
        }
      },
      {
        "column": "species",
        "label": "Species",
        "type": "categorical",
        "width": 80
      },
      {
        "column": "strain_name",
        "label": "Strain",
        "type": "categorical",
        "width": 120
      }
    ],
  },
  "title": "PanVA: Pectobacterium"
}
```
