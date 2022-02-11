<template>
  <v-responsive aspect-ratio="1.5">
    <v-progress-linear :active="loading" indeterminate></v-progress-linear>
    <l-map
      ref="lMap"
      :center="center"
      :crs="crs"
      :options="mapOptions"
      :zoom="zoom"
    >
      <l-control-layers
        position="topright"
        :autoZIndex="false"
      ></l-control-layers>
      <l-tile-layer
        v-for="item in baseTileLayers"
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
</template>

<script lang="ts">
import { EPSG_2056, sitgCrs, swisstopoCrs } from "@/utils/geo";
import { ALL_COLORS } from "@/utils/vuetify";
import axios from "axios";
import interpolate from "color-interpolate";
import { identify } from "geoblaze";
import parseGeoRaster from "georaster";
import GeoRasterLayer, { GeoRaster } from "georaster-layer-for-leaflet";
import L, {
  Control,
  CRS,
  DomUtil,
  GeoJSON,
  GridLayer,
  Layer,
  LayerEvent,
  LeafletMouseEvent,
  Map,
  MapOptions,
  Proj,
  TileLayerOptions,
} from "leaflet";
import "leaflet.browser.print/dist/leaflet.browser.print.min.js";
import { sample } from "lodash";
import { lookup } from "mime-types";
import proj4 from "proj4";
import "proj4leaflet";
import { Proj4GeoJSONFeature } from "proj4leaflet";
import { parseZip } from "shpjs";
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
  readonly mapOptions: MapOptions = {
    zoomControl: false,
  };
  readonly zoom = 5;
  readonly center = [46.2044, 6.1432];
  readonly baseTileLayers: TileLayerProps[] = [
    {
      name: "SITG",
      visible: true,
      attribution:
        '&copy; <a target="_blank" href="https://ge.ch/sitg/">SITG</a>',
      url: "https://ge.ch/sitgags2/rest/services/RASTER/PLAN_SITG/MapServer/WMTS/tile/1.0.0/RASTER_PLAN_SITG/default/default028mm/{z}/{y}/{x}.png",
      options: {
        maxZoom: 11,
        crs: sitgCrs,
      },
    },
    {
      name: "swisstopo-landeskarte-farbe",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-farbe-10/default/current/2056/{z}/{x}/{y}.png",
      subdomains: "0123456789",
      options: {
        maxZoom: 27,
        crs: swisstopoCrs,
      },
    },
    {
      name: "swisstopo-landeskarte-grau",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-grau-10/default/current/2056/{z}/{x}/{y}.png",
      subdomains: "0123456789",
      options: {
        maxZoom: 27,
        crs: swisstopoCrs,
      },
    },
    {
      name: "swisstopo-pixelkarte-farbe",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg",
      subdomains: "0123456789",
      options: {
        maxZoom: 27,
        crs: swisstopoCrs,
      },
    },
    {
      name: "swisstopo-pixelkarte-grau",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/2056/{z}/{x}/{y}.jpeg",
      subdomains: "0123456789",
      options: {
        maxZoom: 27,
        crs: swisstopoCrs,
      },
    },
    {
      name: "swisstopo-photo",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/2056/{z}/{x}/{y}.jpeg",
      subdomains: "0123456789",
      options: {
        maxZoom: 28,
        crs: swisstopoCrs,
      },
    },
    {
      name: "None",
      url: "",
      visible: false,
      options: {
        maxZoom: 28,
      },
    },
  ];

  @Ref()
  readonly lMap!: LMap;

  @Prop({ default: () => [] })
  readonly items!: MapItem[];
  @Prop({ default: () => [] })
  readonly dems!: string[];

  loading = false;
  fileLayers: FileLayer[] = [];
  layers: MapLayer[] = [];
  demGeorasters: GeoRaster[] = [];
  crs: CRS =
    this.baseTileLayers.find((layer) => layer.visible)?.options?.crs ??
    swisstopoCrs;

  get map(): Map {
    return this.lMap.mapObject;
  }

  created(): void {
    proj4.defs("urn:ogc:def:crs:EPSG::2056", EPSG_2056);
  }

  mounted(): void {
    const Coordinates = Control.extend({
      onAdd: (map: Map) => {
        const container = DomUtil.create("div");
        map.addEventListener("mousemove", (e: LeafletMouseEvent) => {
          const point = this.crs.project(e.latlng);
          const altitude: number | undefined = this.demGeorasters
            .flatMap((georaster) => identify(georaster, [point.x, point.y]))
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
    this.map.on("baselayerchange", (e: LayerEvent) => {
      this.crs =
        (e.layer as Layer & { options: BaseTileLayerOptions }).options.crs ??
        this.crs;
    });
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
    this.demGeorasters = [];
    this.dems.forEach((dem) => {
      axios
        .get(dem, { responseType: "arraybuffer" })
        .then((response) => parseGeoRaster(response.data))
        .then((georaster: GeoRaster) => {
          this.demGeorasters.push(georaster);
        });
    });
  }

  @Watch("items")
  onItemsChanged(): void {
    const promises: Promise<FileLayer>[] = this.items.map((item) => {
      if (typeof item.asset === "string") {
        const url: string = item.asset;
        return axios.get(url, { responseType: "blob" }).then((response) => {
          const mimeType = lookup(url);
          return {
            id: url,
            file: new File([response.data], url.split("/").pop() ?? url, {
              type: mimeType || undefined,
            }),
            color: item.color,
          };
        });
      } else {
        return Promise.resolve({
          id: item.asset.name,
          file: item.asset,
          color: item.color,
        });
      }
    });
    Promise.all(promises).then((layers) => (this.fileLayers = layers));
  }

  @Watch("fileLayers")
  onFileLayersChanged(): void {
    const newIds: Set<string> = new Set(
      this.fileLayers.map((layer) => layer.id)
    );
    this.layers.forEach((layer, index) => {
      if (layer.id !== undefined && !newIds.has(layer.id)) {
        this.deleteLayer(layer, index);
      }
    });
    const oldIds: Set<string> = new Set(
      this.layers
        .map((layer) => layer.id)
        .filter((id): id is string => id !== undefined)
    );
    const newFileLayers: FileLayer[] = this.fileLayers.filter(
      (layer) => !oldIds.has(layer.id)
    );
    if (newFileLayers.length > 0) {
      this.addLayers(newFileLayers);
    }
  }

  addLayers(layers: FileLayer[]): void {
    if (layers.length > 0) {
      this.loading = true;
      const layerPromises: Promise<MapLayer>[] = layers.map((layer) => {
        const color: Color = sample(ALL_COLORS) ?? colors.blue;
        switch (layer.file.type) {
          case "image/tiff":
            return layer.file
              .arrayBuffer()
              .then((arrayBuffer) => parseGeoRaster(arrayBuffer))
              .then((georaster: ExtendedGeoRaster) => {
                const colorMin = color.lighten5;
                const colorMax = color.darken4;
                const palette = interpolate([colorMin, colorMax]);
                const noDataZero = georaster.mins[0] === 0;
                return {
                  id: layer.id,
                  name: layer.file.name,
                  color: color,
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
            return layer.file
              .arrayBuffer()
              .then((arrayBuffer) => parseZip(arrayBuffer))
              .then((geojson) => ({
                id: layer.id,
                name: layer.file.name,
                color: color,
                layer: Proj.geoJson(geojson as unknown as Proj4GeoJSONFeature, {
                  style: {
                    color: color.base,
                  },
                }),
              }));
        }
        const extension = layer.file.name.split(".").pop();
        switch (extension) {
          case "geojson":
          case "json":
            return layer.file
              .text()
              .then(JSON.parse)
              .then((json) => ({
                id: layer.id,
                name: layer.file.name,
                color: color,
                layer: Proj.geoJson(json, {
                  style: {
                    color: color.base,
                  },
                }),
              }));
        }
        return Promise.reject(
          `unsupported type ${layer.file.type} for file ${layer.file.name}`
        );
      });
      Promise.all(layerPromises)
        .then((layers) => {
          layers.forEach((layer) => {
            layer.layer.addTo(this.map);
            layer.layer.bringToFront();
            this.layers.unshift(layer);
          });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  public moveLayerToFront(id: string): void {
    const [layer, index] = this.getLayer(id);
    layer.layer.bringToFront();
    this.layers.unshift(...this.layers.splice(index, 1));
  }

  public deleteLayerId(id: string): void {
    const [layer, index] = this.getLayer(id);
    this.deleteLayer(layer, index);
  }

  private deleteLayer(layer: MapLayer, index: number): void {
    this.map.removeLayer(layer.layer);
    this.layers.splice(index, 1);
  }

  private getLayer(id: string): [MapLayer, number] {
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index < 0) {
      throw new Error(`Layer ${id} not found`);
    }
    const layer = this.layers[index];
    return [layer, index];
  }
}

export interface MapItem {
  id: string;
  asset: string | File;
  color: Color;
}

export interface MapLayer {
  id: string;
  name: string;
  color: Color;
  layer: GridLayer | GeoJSON;
  colorScale?: {
    colorMin: string;
    colorMax: string;
    valueMin: number;
    valueMax: number;
  };
}

/**
 * https://vue2-leaflet.netlify.app/components/LTileLayer.html#props
 */
interface TileLayerProps {
  attribution?: string;
  name: string;
  visible: boolean;
  subdomains?: string | string[];
  // https://leafletjs.com/reference.html#tilelayer
  options?: BaseTileLayerOptions;
  url: string;
}

type BaseTileLayerOptions = TileLayerOptions & { crs?: CRS };

interface FileLayer {
  id: string;
  file: File;
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
  background-color: unset;
  z-index: 0;
}
.leaflet-grab {
  cursor: crosshair;
}
</style>
