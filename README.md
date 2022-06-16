# Alice Landings

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Data

```bash
# Set all files of folder to acl public
s3cmd setacl --recursive --acl-public s3://${BUCKET_NAME}/alicelandings/2022-06-16/
```
