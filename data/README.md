# Alice Landings Data

## Setup

1. Copy data from "plhebicite" drive in folder `/wip/2021_ENAC_CLUSTER_PLHEBICITE/plh_full_mapping/220627/` to `./raw/` folder.
2. `make process`
3. Upload `./out/` folder to [ENAC-IT4R CDN](https://github.com/EPFL-ENAC/enacit4r-cdn) `s3cmd put --recursive --acl-public --guess-mime-type . s3://${BUCKET_NAME}/alicelandings/2022-06-20/`

## CLI

```bash
# Set all files of folder to acl public
s3cmd setacl --recursive --acl-public s3://${BUCKET_NAME}/alicelandings/2022-06-16/
```
