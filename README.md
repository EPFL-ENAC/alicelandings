# Alice Landings

## Project setup

```
make install
```

## Data

```bash
# Set all files of folder to acl public
s3cmd setacl --recursive --acl-public s3://${BUCKET_NAME}/alicelandings/2022-06-16/
```
