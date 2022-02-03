<template>
  <v-row>
    <v-col cols="8">
      <v-progress-linear :active="loading" indeterminate></v-progress-linear>
      <v-responsive aspect-ratio="1.5">
        <l-map
          ref="lMap"
          :center="center"
          :options="{ zoomControl: false }"
          :zoom="zoom"
        >
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
    <v-col cols="4">
      <h2>Layers</h2>
      <v-file-input
        v-model="layerFiles"
        accept="application/json, application/x-zip-compressed, image/tiff, .geojson"
        chips
        clearable
        label="Add layer"
        multiple
        show-size
        @change="addExternalLayers"
      ></v-file-input>
      <v-list>
        <v-list-item
          v-for="(item, index) in layers"
          :key="index"
          :color="item.color.base"
          :input-value="layerActives[index]"
        >
          <v-list-item-action>
            <v-checkbox
              v-model="layerActives[index]"
              :color="item.color.base"
            ></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle
              v-if="item.colorScale"
              class="d-flex justify-space-between"
              :style="{
                backgroundImage: `linear-gradient(to right, ${item.colorScale.colorMin}, ${item.colorScale.colorMax})`,
              }"
            >
              <span>{{ item.colorScale.valueMin }}</span>
              <span>{{ item.colorScale.valueMax }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
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
import axios from "axios";
import interpolate from "color-interpolate";
import { identify } from "geoblaze";
import geojson from "geojson";
import parseGeoRaster from "georaster";
import GeoRasterLayer, { GeoRaster } from "georaster-layer-for-leaflet";
import L, {
  Control,
  DomUtil,
  GeoJSON,
  GridLayer,
  LeafletMouseEvent,
  Map,
} from "leaflet";
import "leaflet.browser.print/dist/leaflet.browser.print.min.js";
import { sample } from "lodash";
import { parseZip } from "shpjs";
import { WGStoLV95 } from "swiss-projection";
import "vue-class-component/hooks";
import { Component, Prop, Ref, Vue, Watch } from "vue-property-decorator";
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
      name: "None",
      url: "",
      visible: false,
      options: {
        maxZoom: 25,
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

  @Prop({ default: () => [] })
  readonly items!: string[];
  @Prop({ default: () => [] })
  readonly dems!: string[];

  loading = false;
  layers: MapLayer[] = [];
  layerFiles: File[] = [];
  layerActives: boolean[] = [];
  georasters: GeoRaster[] = [];

  get map(): Map {
    return this.lMap.mapObject;
  }

  mounted(): void {
    const Coordinates = Control.extend({
      onAdd: (map: Map) => {
        const container = DomUtil.create("div");
        map.addEventListener("mousemove", (e: LeafletMouseEvent) => {
          const latlng = WGStoLV95([e.latlng.lng, e.latlng.lat]);
          const altitude: number | undefined = this.georasters
            .flatMap((georaster) => identify(georaster, latlng))
            .find((value) => value); // defined && !== 0
          const positionText = `Lat/Lon:
          (${e.latlng.lat.toFixed(4)}; ${e.latlng.lng.toFixed(4)})`;
          container.innerHTML =
            altitude !== undefined
              ? [`Altitude: ${altitude.toFixed(0)} m`, positionText].join(
                  "<br>"
                )
              : positionText;
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

    this.onDemsChanged();
  }

  @Watch("dems")
  onDemsChanged(): void {
    this.georasters = [];
    this.dems.forEach((dem) => {
      axios
        .get(dem, { responseType: "arraybuffer" })
        .then((response) => parseGeoRaster(response.data))
        .then((georaster: GeoRaster) => {
          this.georasters.push(georaster);
        });
    });
  }

  @Watch("items")
  onItemsChanged(): void {
    const newIds = new Set(this.items);
    this.layers.forEach((layer, index) => {
      if (layer.internalId !== undefined && !newIds.has(layer.internalId)) {
        this.deleteLayer(layer, index);
      }
    });
    const oldIds = new Set(
      this.layers
        .map((layer) => layer.internalId)
        .filter((id): id is string => id !== undefined)
    );
    const newItems = this.items.filter((item) => !oldIds.has(item));
    if (newItems.length > 0) {
      this.loading = true;
      Promise.all(
        newItems.map((item) =>
          axios.get(item, { responseType: "blob" }).then((response) => {
            return {
              internalId: item,
              file: new File([response.data], item.split("/").pop() ?? item, {
                type: response.headers["content-type"].split(";")[0],
              }),
            };
          })
        )
      ).then((files) => this.addLayerFiles(files));
    }
  }

  @Watch("layerActives")
  onLayerActivesChanged(actives: boolean[]): void {
    actives.forEach((active, index) => {
      const opacity = active ? 1 : 0;
      const layer = this.layers[index].layer;
      if (layer instanceof GridLayer) {
        layer.setOpacity(opacity);
      }
    });
  }

  addExternalLayers(files: File[]): void {
    this.addLayerFiles(
      files.map((file) => ({
        file: file,
      }))
    );
  }

  addLayerFiles(files: LayerFile[]): void {
    if (files.length > 0) {
      this.loading = true;
      const layerPromises: Promise<MapLayer>[] = files.map((file) => {
        const color: Color = sample(ALL_COLORS) ?? colors.blue;
        switch (file.file.type) {
          case "image/tiff":
            return file.file
              .arrayBuffer()
              .then((arrayBuffer) => parseGeoRaster(arrayBuffer))
              .then((georaster: ExtendedGeoRaster) => {
                const colorMin = color.lighten5;
                const colorMax = color.darken4;
                const palette = interpolate([colorMin, colorMax]);
                const noDataZero = georaster.mins[0] === 0;
                return {
                  name: file.file.name,
                  color: color,
                  internalId: file.internalId,
                  layer: new GeoRasterLayer({
                    georaster: georaster,
                    pixelValuesToColorFn: (values) => {
                      if (noDataZero && values[0] === 0) {
                        return colors.shades.transparent;
                      }
                      const value =
                        (values[0] - georaster.mins[0]) / georaster.ranges[0];
                      return palette(value);
                    },
                    resolution: 128,
                  }),
                  colorScale: {
                    colorMin: colorMin,
                    colorMax: colorMax,
                    valueMin: georaster.mins[0],
                    valueMax: georaster.maxs[0],
                  },
                };
              });
          case "application/x-zip-compressed":
            return file.file
              .arrayBuffer()
              .then((arrayBuffer) => parseZip(arrayBuffer))
              .then((geojson) => ({
                name: file.file.name,
                color: color,
                internalId: file.internalId,
                layer: L.geoJSON(geojson as geojson.GeoJsonObject),
              }));
        }
        const extension = file.file.name.split(".").pop();
        switch (extension) {
          case "geojson":
          case "json":
            return file.file
              .text()
              .then(JSON.parse)
              .then((json) => ({
                name: file.file.name,
                color: color,
                internalId: file.internalId,
                layer: L.geoJSON(json),
              }));
        }
        return Promise.reject(
          `unsupported type ${file.file.type} for file ${file.file.name}`
        );
      });
      Promise.all(layerPromises)
        .then((layers) => {
          layers.forEach((layer) => {
            layer.layer.addTo(this.map);
            layer.layer.bringToFront();
            this.layers.unshift(layer);
            this.layerActives.unshift(true);
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
    this.layerActives.unshift(...this.layerActives.splice(index, 1));
  }

  deleteLayer(layer: MapLayer, index: number): void {
    this.map.removeLayer(layer.layer);
    this.layers.splice(index, 1);
    this.layerActives.splice(index, 1);
  }
}

/**
 * https://vue2-leaflet.netlify.app/components/LTileLayer.html#props
 * https://leafletjs.com/reference.html#tilelayer
 */
interface TileLayerProps {
  attribution?: string;
  name: string;
  visible: boolean;
  subdomains?: string | string[];
  options?: {
    maxZoom?: number;
  };
  url: string;
}

interface LayerFile {
  internalId?: string;
  file: File;
}

interface MapLayer {
  name: string;
  color: Color;
  layer: GridLayer | GeoJSON;
  internalId?: string;
  colorScale?: {
    colorMin: string;
    colorMax: string;
    valueMin: number;
    valueMax: number;
  };
}

interface ExtendedGeoRaster extends GeoRaster {
  mins: number[];
  maxs: number[];
  ranges: number[];
}
</script>

<style scoped>
.leaflet-container {
  background-color: unset;
  z-index: 0;
}
.leaflet-grab {
  cursor: crosshair;
}
</style>
