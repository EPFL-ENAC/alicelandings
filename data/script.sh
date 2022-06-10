#!/bin/sh

RAW_ROOT="/opt/raw"
OUT_ROOT="/opt/out"
PROCESSES=8
ZOOMS="0-6" # saving processing time for test

for file in $(find $RAW_ROOT -name "*.geojson"); do
    outputFile=$OUT_ROOT${file#"$RAW_ROOT"}
    echo "processing $file -> $outputFile"
    mkdir -p "$(dirname "$outputFile")"
    cp "$file" "$outputFile"
    sldFile=${file%.geojson}.sld
    echo $sldFile
    if [ -e $sldFile ]; then
        cp $sldFile ${outputFile%.geojson}.sld
    fi
done

for file in $(find $RAW_ROOT -name "*.tif"); do
    outputFile=$OUT_ROOT${file#"$RAW_ROOT"}
    echo "processing $file -> $outputFile"
    if [ ! -e $outputFile ]; then
        mkdir -p "$(dirname "$outputFile")"
        gdal_translate "$file" "$outputFile" -co TILED=YES -co COMPRESS=DEFLATE
        gdaladdo -ro -r average "$outputFile"
    fi
done

for file in $(find $RAW_ROOT -name "*.pgw"); do
    outputFile=$OUT_ROOT${file#"$RAW_ROOT"}
    echo "$(date) processing $file -> $outputFile"
    start_time=$(date +%s)
    gdal2tiles.py -p raster -s "EPSG:2056" --xyz -z $ZOOMS -e --processes=$PROCESSES -w all "${file%.pgw}.png" "${outputFile%.pgw}"
    end_time=$(date +%s)
    echo "execution time was $(expr $end_time - $start_time) s."
done
