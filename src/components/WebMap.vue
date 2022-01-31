<template>
  <v-row>
    <v-col cols="9">
      <v-file-input
        v-model="layerFiles"
        accept="application/json, application/x-zip-compressed, image/tiff, .geojson"
        chips
        clearable
        label="Add layer"
        multiple
        show-size
        @change="addLayerFiles"
      ></v-file-input>
      <v-progress-linear :active="loading" indeterminate></v-progress-linear>
      <v-responsive aspect-ratio="1.8">
        <l-map ref="lMap" :zoom="zoom" :center="center">
          <l-control-layers
            position="topright"
            :autoZIndex="false"
          ></l-control-layers>
          <l-tile-layer
            v-for="item in tileProviders"
            :key="item.name"
            :attribution="item.attribution"
            layer-type="base"
            :name="item.name"
            :options="item.options"
            :subdomains="item.subdomains"
            :url="item.url"
            :visible="item.visible"
          ></l-tile-layer>
          <l-control-scale
            position="bottomright"
            :imperial="false"
          ></l-control-scale>
          <l-control-zoom position="bottomright"></l-control-zoom>
        </l-map>
      </v-responsive>
    </v-col>
    <v-col cols="3">
      <h2>Layers</h2>
      <v-list>
        <v-list-item
          v-for="(item, index) in layers"
          :key="index"
          :color="item.color.base"
          input-value="true"
        >
          <v-list-item-title>
            {{ item.name }}
          </v-list-item-title>
          <v-list-item-action>
            <v-btn icon @click="moveLayerToFront(item, index)">
              <v-icon>mdi-flip-to-front</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn icon @click="deleteLayer(item, index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { ALL_COLORS } from "@/utils/vuetify";
import interpolate from "color-interpolate";
import geojson from "geojson";
import parseGeoRaster from "georaster";
import GeoRasterLayer, { GeoRaster } from "georaster-layer-for-leaflet";
import L, {
  Control,
  DomUtil,
  GridLayer,
  LeafletMouseEvent,
  Map,
} from "leaflet";
import "leaflet.browser.print/dist/leaflet.browser.print.min.js";
import _ from "lodash";
import { parseZip } from "shpjs";
import "vue-class-component/hooks";
import { Component, Ref, Vue } from "vue-property-decorator";
import {
  LControlLayers,
  LControlScale,
  LControlZoom,
  LMap,
  LTileLayer,
} from "vue2-leaflet";
import colors, { Color } from "vuetify/lib/util/colors";

@Component({
  components: {
    LControlLayers,
    LControlScale,
    LControlZoom,
    LMap,
    LTileLayer,
  },
})
export default class WebMap extends Vue {
  readonly zoom = 10;
  readonly center = [46.2044, 6.1432];
  readonly tileProviders: TileLayerProps[] = [
    {
      name: "OpenStreetMap",
      visible: true,
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
      },
    },
    {
      // https://api3.geo.admin.ch/services/sdiservices.html#wmts
      name: "swisstopo",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
      subdomains: "0123456789", // https://api3.geo.admin.ch/services/sdiservices.html#gettile
      options: {
        maxZoom: 19,
      },
    },
    {
      // https://ge.ch/sitgags2/rest/services/RASTER/PLAN_SITG/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
      name: "SITG",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://ge.ch/sitg/">SITG</a>',
      url: "https://ge.ch/sitgags2/rest/services/RASTER/PLAN_SITG/MapServer/WMTS/tile/1.0.0/RASTER_PLAN_SITG/default/default028mm/{z}/{y}/{x}.png",
      options: {
        maxZoom: 11,
      },
    },
  ];

  @Ref()
  readonly lMap!: LMap;

  loading = false;
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
    (L.control as any).browserPrint().addTo(this.map);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.Control as any).BrowserPrint.Utils.registerLayer(
      GeoRasterLayer,
      "GeoRasterLayer",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (layer: any) {
        return new GeoRasterLayer(layer.options);
      }
    );
  }

  addLayerFiles(files: File[]): void {
    const color: Color = _.sample(ALL_COLORS) ?? colors.blue;
    const colormap = interpolate([color.lighten5, color.darken4]);
    if (files.length > 0) {
      this.loading = true;
      const layerPromises: Promise<MapLayer>[] = files.map((file) => {
        switch (file.type) {
          case "image/tiff":
            return file
              .arrayBuffer()
              .then((arrayBuffer) => parseGeoRaster(arrayBuffer))
              .then((georaster: ExtendedGeoRaster) => {
                return {
                  color: color,
                  name: file.name,
                  layer: new GeoRasterLayer({
                    georaster: georaster,
                    pixelValuesToColorFn: (values) => {
                      if (values[0] === 0) {
                        return colors.shades.transparent;
                      }
                      const value =
                        (values[0] - georaster.mins[0]) / georaster.ranges[0];
                      return colormap(value);
                    },
                  }),
                };
              });
          case "application/x-zip-compressed":
            return file
              .arrayBuffer()
              .then((arrayBuffer) => parseZip(arrayBuffer))
              .then((geojson) => ({
                color: color,
                name: file.name,
                layer: L.geoJSON(geojson as geojson.GeoJsonObject),
              }));
        }
        const extension = file.name.split(".").pop();
        switch (extension) {
          case "geojson":
          case "json":
            return file
              .text()
              .then(JSON.parse)
              .then((json) => ({
                color: color,
                name: file.name,
                layer: L.geoJSON(json),
              }));
        }
        return Promise.reject(
          `unsupported type ${file.type} for file ${file.name}`
        );
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

  moveLayerToFront(layer: MapLayer, index: number): void {
    layer.layer.bringToFront();
    this.layers.unshift(...this.layers.splice(index, 1));
  }

  deleteLayer(layer: MapLayer, index: number): void {
    this.map.removeLayer(layer.layer);
    this.layers.splice(index, 1);
  }
}

/**
 * https://vue2-leaflet.netlify.app/components/LTileLayer.html#props
 * https://leafletjs.com/reference.html#tilelayer
 */
interface TileLayerProps {
  attribution: string;
  name: string;
  visible: boolean;
  subdomains?: string | string[];
  options?: {
    maxZoom?: number;
  };
  url: string;
}

interface MapLayer {
  name: string;
  layer: GridLayer;
  color: Color;
}

interface ExtendedGeoRaster extends GeoRaster {
  mins: number[];
  maxs: number[];
  ranges: number[];
}
</script>

<style scoped>
.leaflet-container {
  z-index: 0;
}
</style>
