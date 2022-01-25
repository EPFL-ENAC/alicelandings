<template>
  <v-row>
    <v-col cols="6">
      <v-file-input
        accept=".geojson, application/json"
        chips
        clearable
        hide-details
        label="GeoJSON"
        multiple
        show-size
        @change="addGeoJsonFiles"
      ></v-file-input>
    </v-col>
    <v-col cols="6">
      <v-file-input
        v-model="layerFiles"
        accept="application/x-zip-compressed, image/tiff"
        chips
        clearable
        hide-details
        label="Add layer"
        multiple
        show-size
        @change="addLayerFiles"
      ></v-file-input>
    </v-col>
    <v-col cols="12">
      <v-progress-linear :active="loading" indeterminate></v-progress-linear>
      <v-responsive aspect-ratio="1.6">
        <l-map ref="lMap" :zoom="zoom" :center="center">
          <l-control-layers
            position="topright"
            :autoZIndex="false"
          ></l-control-layers>
          <l-tile-layer
            v-for="tileProvider in tileProviders"
            :key="tileProvider.name"
            :name="tileProvider.name"
            :visible="tileProvider.visible"
            :url="tileProvider.url"
            :attribution="tileProvider.attribution"
            layer-type="base"
          ></l-tile-layer>
          <l-control-scale
            position="bottomright"
            :imperial="false"
          ></l-control-scale>
          <l-control-zoom position="bottomright"></l-control-zoom>
          <l-geo-json
            v-for="(item, index) in geoJsons"
            :key="index"
            :geojson="item"
          ></l-geo-json>
        </l-map>
      </v-responsive>
    </v-col>
    <v-col cols="12">
      <v-list>
        <v-list-item v-for="(item, index) in layers" :key="index">
          <v-list-item-title>
            {{ item.name }}
          </v-list-item-title>
          <v-list-item-action>
            <v-btn icon @click="deleteLayer(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import geojson from "geojson";
import parseGeoRaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import L, {
  Control,
  DomUtil,
  GridLayer,
  LeafletMouseEvent,
  Map,
} from "leaflet";
import "leaflet.bigimage/dist/Leaflet.BigImage.min.js";
import { parseZip } from "shpjs";
import "vue-class-component/hooks";
import { Component, Ref, Vue } from "vue-property-decorator";
import {
  LControlLayers,
  LControlScale,
  LControlZoom,
  LGeoJson,
  LMap,
  LTileLayer,
} from "vue2-leaflet";

@Component({
  components: {
    LControlLayers,
    LControlScale,
    LControlZoom,
    LGeoJson,
    LMap,
    LTileLayer,
  },
})
export default class WebMap extends Vue {
  readonly zoom = 15;
  readonly center = [46.51725, 6.56885];
  readonly tileProviders: TileProvider[] = [
    {
      name: "OpenStreetMap",
      visible: true,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    },
    {
      name: "swisstopo",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
    },
  ];

  @Ref()
  readonly lMap!: LMap;

  loading = false;
  geoJsons: unknown[] = [];
  layers: MapLayer[] = [];
  layerFiles: File[] = [];

  get map(): Map {
    return this.lMap.mapObject;
  }

  mounted(): void {
    const Coordinates = Control.extend({
      onAdd: (map: Map) => {
        const container = DomUtil.create("div");
        map.addEventListener("mousemove", (e: LeafletMouseEvent) => {
          container.innerHTML = `
          Latitude/Longitude:
          (${e.latlng.lat.toFixed(4)}; ${e.latlng.lng.toFixed(4)})`;
        });
        map.addEventListener("mouseout", () => {
          container.innerHTML = "";
        });
        return container;
      },
    });
    this.map.addControl(new Coordinates({ position: "bottomleft" }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.control as any).BigImage().addTo(this.map);
  }

  addGeoJsonFiles(files: File[]): void {
    if (files.length > 0) {
      this.loading = true;
      Promise.all(files.map((file) => file.text().then(JSON.parse))).then(
        (values) => {
          this.geoJsons = values;
          this.loading = false;
        }
      );
    }
  }

  addLayerFiles(files: File[]): void {
    if (files.length > 0) {
      this.loading = true;
      const layerPromises: Promise<MapLayer>[] = files.map((file) => {
        switch (file.type) {
          case "image/tiff":
            return file
              .arrayBuffer()
              .then((arrayBuffer) => parseGeoRaster(arrayBuffer))
              .then((georaster) => ({
                name: file.name,
                layer: new GeoRasterLayer({
                  georaster: georaster,
                }),
              }));
          case "application/x-zip-compressed":
            return file
              .arrayBuffer()
              .then((arrayBuffer) => parseZip(arrayBuffer))
              .then((geojson) => {
                console.log(geojson);
                return {
                  name: file.name,
                  layer: L.geoJSON(geojson as geojson.GeoJsonObject),
                };
              });
          default:
            return Promise.reject(
              `unsupported type ${file.type} for file ${file.name}`
            );
        }
      });
      Promise.all(layerPromises)
        .then((layers) => {
          layers.forEach((layer) => {
            layer.layer.addTo(this.map);
            layer.layer.bringToFront();
            this.layers.push(layer);
          });
        })
        .finally(() => {
          this.loading = false;
          this.layerFiles = [];
        });
    }
  }

  deleteLayer(layer: MapLayer): void {
    this.map.removeLayer(layer.layer);
    this.layers = this.layers.filter((l) => l !== layer);
  }
}

interface TileProvider {
  name: string;
  visible: boolean;
  attribution: string;
  url: string;
}

interface MapLayer {
  name: string;
  layer: GridLayer;
}
</script>

<style scoped>
.leaflet-container {
  z-index: 0;
}
</style>
