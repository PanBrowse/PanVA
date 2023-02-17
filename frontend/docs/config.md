# Configuration

The PanVA application can be configured with a runtime configuration file `config.json` placed in the root directory of the application.

## Options

All fields are optional.

| Field               | Type           | Default value                                 |
|---------------------|----------------|-----------------------------------------------|
| `annotations`       | `Annotation[]` | `[]`                                          |
| `apiUrl`            | `string`       | `"/api/"`                                     |
| `defaultHomologyId` | `integer`      | The first homology id in the homologies list. |
| `filters`           | `Filter[]`     | `[]`                                          |
| `metadata`          | `Metadata[]`   | `[]`                                          |
| `title`             | `string`       | `"PanVA"`                                     |


## Annotation

Positions can be annotated with one or more features. You can configure which annotations should be displayed.

Each column should be configured as a JSON object with the following options:

| Field    | Type     | Required           | Notes                                                                                                                                   |
|----------|----------|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `column` | `string` | :heavy_check_mark: | CSV column in [`annotations.csv`](../../api/docs/data-format.md#annotationscsv-optional).                                               |
| `label`  | `string` | :heavy_check_mark: | Description of the annotation.                                                                                                          |
| `color`  | `string` |                    | Color used when drawing the annotation. You can use [HTML color names](https://www.w3schools.com/tags/ref_colornames.asp) or hex codes. |


## Filter

Positions can be filtered based on variable position properties. You can configure which properties should be available.

Each column should be configured as a JSON object with the following options:

| Field    | Type     | Notes                                                                      |
|----------|----------|----------------------------------------------------------------------------|
| `column` | `string` | CSV column in [`variable.csv`](../../api/docs/data-format.md#variablecsv). |
| `label`  | `string` | Description of the property.                                               |


## Metadata

Metadata can be visualized in a number of different ways. You can configure which columns should be displayed.

Each column should be configured as a JSON object with the following options:

| Field    | Type                                           | Notes                                                                               |
|----------|------------------------------------------------|-------------------------------------------------------------------------------------|
| `column` | `string`                                       | CSV column in [`metadata.csv`](../../api/docs/data-format.md#metadatacsv-optional). |
| `label`  | `string`                                       | Shown above the column.                                                             |
| `type`   | `"boolean" \| "categorical" \| "quantitative"` |                                                                                     |

Based on the value of `type` these options are extended with the options as defined below.

**Important:** The `column` property must be unique across all Metadata objects; a column from [`metadata.csv`](../../api/docs/data-format.md#metadatacsv-optional) can not be used multiple times.


### Boolean

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


### Categorical

| Field   | Type     | Required           | Notes                |
|---------|----------|--------------------|----------------------|
| `width` | `number` | :heavy_check_mark: | Width of the column. |



### Quantitative

| Field      | Type     | Required           | Notes                                                                           |
|------------|----------|--------------------|---------------------------------------------------------------------------------|
| `decimals` | `number` |                    | Maximum number of decimals to display. <br> Trailing zeroes are removed.        |
| `maxValue` | `number` |                    | Maximum value to determine bar width. <br> Defaults to maximum value in column. |
| `suffix`   | `string` |                    | String to be placed behind the numeric value (e.g. `"%"`)                       |
| `width`    | `number` | :heavy_check_mark: | Width of the column.                                                            |


## Example configuration file

```json
{
  "apiUrl": "/pecto/",
  "defaultHomologyId": 13803671,
  "annotations": [
    {
      "column": "cds",
      "label": "CDS",
      "color": "pink"
    }
  ],
  "filters": [
    {
      "column": "pheno_specific",
      "label": "Phenotype specific"
    }
  ],
  "metadata": [
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
  "title": "PanVA: Pectobacterium"
}
```
