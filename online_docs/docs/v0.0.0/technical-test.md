# Technical test <Badge type="info" text="v0.0.0" />

We **strongly recommend** to start with this technical test of the installation on a small yeast dataset before running PanVA on your own data. 

## From raw data to PanVA instance

PanVA requires data that follows [this format](./data-format-homology.md). 

### PanTools and PanUtils
We recommend to use our PanUtils pipelines to go generate input data in the correct format.
Three PanUtils pipelines can be used in the following order:
1. **QC**: Filter and do quality control of raw data
2. **Pantools functions**: Build a pangenome and run necessary analysis functions
3. **Preprocessing PanVA**: Preprocess the PanTools data must for PanVA. 

::: info

The protocol with detailed steps for each pipeline is given [here](https://pantools.readthedocs.io/en/update_tutorial/tutorial/tutorial_part7.html).

:::

After running the pipelines and downloading the preprocessed data, you can continue to the PanVA protocol below.

### PanVA

With the preprocessed data, we can launch a PanVA yeast instance in three simple steps. Before doing so, check whether your preprocessed data has the following directory structure with at least `config.json`, `homologies.json`, and `genome_gene_distance.txt`:

```
pangenome_db_grouping_v1_panva_input/
   └─ homology/
       ├─ config.json
       ├─ homologies.json
       ├─ genome_gene_distance.txt
       └─ [<homology_id> directories]
```


1. **Install and run [Docker](https://docs.docker.com/get-docker/).** With Docker Desktop, make sure the application is running. 
To check whether Docker is succesfully installed, open the terminal and run:
```
docker --version
```

2. **Run PanVA.** From any location, run this command in your terminal, changing the two parameter paths explained below to your own setup:
```
docker run -p 8080:80 --name panva_yeast -v /path/to/your/data:/panva/api/data -v /path/to/your/config.json:/panva/frontend/config.json -e APACHE_UID=1000 -e APACHE_GID=1000 ghcr.io/panbrowse/panva:main
```


- ##### `/path/to/your/data`
    path should point to a directory containing a `/homology` directory, e.g.,: `{YOUR_FULL_PATH}/pangenome_db_grouping_v1_panva_input` <br>
  ***Note***: Make sure this data directory is writable 

- ##### `/path/to/your/config.json`
    provide the full path to the PanVA config file.  This file can be found in the root folder of the exported data, e.g.,: `{YOUR_FULL_PATH}/pangenome_db_grouping_v1_panva_input/homology/config.json`

More information about the (optional) parameters can be found on the [Installation page](./install.md).

3. **That’s it!** :tada: You can now view your browser instance at: http://localhost:8080. 