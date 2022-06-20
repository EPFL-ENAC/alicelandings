#!/bin/sh

RAW_ROOT="/opt/raw"
OUT_ROOT="/opt/out"
PROCESSES=$(cat /proc/cpuinfo | grep '^processor' | wc -l)

echo "With $PROCESSES processes"

for file in $(find $RAW_ROOT -name "*.geojson" -o -name "*.sld" -o -name "metadata.json"); do
    outputFile=$OUT_ROOT${file#"$RAW_ROOT"}
    echo "processing $file -> $outputFile"
    mkdir -p "$(dirname "$outputFile")"
    cp "$file" "$outputFile"
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
    gdal2tiles.py -p raster -s "EPSG:2056" --xyz -e --processes=$PROCESSES -w all "${file%.pgw}.png" "${outputFile%.pgw}"
    end_time=$(date +%s)
    echo "execution time was $(expr $end_time - $start_time) s."
done

if [ ! -z "${OWNER}" ]; then
    chown -R ${OWNER} ${OUT_ROOT}
fi
