#!/bin/sh

RAW_ROOT="/opt/raw"
OUT_ROOT="/opt/out"

for file in $(find $RAW_ROOT -name "*.tif"); do
    outputFile=$OUT_ROOT${file#"$RAW_ROOT"}
    echo "processing $file -> $outputFile"
    mkdir -p "$(dirname "$outputFile")"
    gdal_translate "$file" "$outputFile" -co TILED=YES -co COMPRESS=DEFLATE
    gdaladdo -ro -r average "$outputFile"
done

for file in $(find $RAW_ROOT -name "*.pgw"); do
    outputFile=$OUT_ROOT${file#"$RAW_ROOT"}
    echo "$(date) processing $file -> $outputFile"
    start_time=$(date +%s)
    gdal2tiles.py -e -w all --processes=8 --xyz -p raster -s "EPSG:2056" "${file%.pgw}.png" "${outputFile%.pgw}"
    end_time=$(date +%s)
    echo "execution time was $(expr $end_time - $start_time) s."
done
