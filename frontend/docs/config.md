# Configuration

The PanVA application can be configured with a runtime configuration file `config.json` placed in the root directory of the application.

## Options

All fields are optional.

| Field               | Type       | Default value                                 |
|---------------------|------------|-----------------------------------------------|
| `apiUrl`            | string     | `"/api/"`                                     |
| `defaultHomologyId` | integer    | The first homology id in the homologies list. |
| `filters`           | Filter[]   | `[]`                                          |
| `metadata`          | Metadata[] | `[]`                                          |
| `title`             | string     | `"PanVA"`                                     |


## Filter

Positions can be filtered based on variable position properties. You can configure which properties should be available.

Each column should be configured as a JSON object with the following options:

| Field   | Type   | Notes                                                                      |
|---------|--------|----------------------------------------------------------------------------|
| `label` | string | Shown in the position filter options.                                      |
| `field` | string | CSV column in [`variable.csv`](../../api/docs/data-format.md#variablecsv). |


## Metadata

Metadata can be visualized in a number of different ways. You can configure which columns should be displayed.

Each column should be configured as a JSON object with the following options:

| Field   | Type                                           | Notes                                                                      |
|---------|------------------------------------------------|----------------------------------------------------------------------------|
| `type`  | `"boolean" \| "categorical" \| "quantitative"` |                                                                            |
| `label` | string                                         | Shown above the column.                                                    |
| `field` | string                                         | CSV column in [`metadata.csv`](../../api/docs/data-format.md#metadatacsv). |

Based on the value of `type` these options are extended with the options as defined below.

Note: A column from [`metadata.csv`](../../api/docs/data-format.md#metadatacsv) can be used multiple times in different columns.


### Boolean

| Field          | Type   | Required           | Notes                                  |
|----------------|--------|--------------------|----------------------------------------|
| `labels`       | object | :heavy_check_mark: | Displayed in tooltip over column.      |
| `labels.true`  | string | :heavy_check_mark: |                                        |
| `labels.false` | string | :heavy_check_mark: |                                        |
| `labels.null`  | string | :heavy_check_mark: |                                        |
| `values`       | object |                    |                                        |
| `values.true`  | string | :heavy_check_mark: | Consider this CSV value to be `true`.  |
| `values.false` | string | :heavy_check_mark: | Consider this CSV value to be `false`. |

When `values` is omitted, the value will be matched (case-insensitive) against `"true" | "t" | "yes" | "y"` for `true` and `"false" | "f" | "no" | "n"` for `false`. All other values will be considered to be unknown (`null`).


### Categorical

| Field   | Type   | Required           | Notes                |
|---------|--------|--------------------|----------------------|
| `width` | number | :heavy_check_mark: | Width of the column. |



### Quantitative

| Field      | Type   | Required           | Notes                                                                           |
|------------|--------|--------------------|---------------------------------------------------------------------------------|
| `width`    | number | :heavy_check_mark: | Width of the column.                                                            |
| `maxValue` | number |                    | Maximum value to determine bar width. <br> Defaults to maximum value in column. |
| `suffix`   | string |                    | String to be placed behind the numeric value (e.g. `"%"`)                       |


## Example configuration file

```json
{
  "apiUrl": "/pecto/",
  "defaultHomologyId": 13803671,
  "filters": [
    {
      "field": "pheno_specific",
      "label": "Phenotype specific"
    }
  ],
  "metadata": [
    {
      "type": "quantitative",
      "field": "ft16",
      "label": "FT16",
      "width": 80
    },
    {
      "type": "boolean",
      "field": "virulence",
      "label": "Virulence",
      "values": {
        "true": "virulent",
        "false": "avirulent"
      },
      "labels": {
        "true": "Virulent",
        "false": "Avirulent",
        "null": "Unknown"
      }
    },
    {
      "type": "categorical",
      "field": "species",
      "label": "Species",
      "width": 80
    },
    {
      "type": "categorical",
      "field": "strain_name",
      "label": "Strain",
      "width": 120
    }
  ],
  "title": "PanVA: Pectobacterium"
}
```
