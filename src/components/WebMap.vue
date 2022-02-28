<template>
  <div class="full-height" style="min-height: 200px">
    <v-progress-linear :active="loading" indeterminate></v-progress-linear>
    <l-map
      ref="lMap"
      :center="center"
      :crs="crs"
      :options="mapOptions"
      :zoom.sync="syncedZoom"
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
  </div>
</template>

<script lang="ts">
import {
  EPSG_2056,
  EPSG_21781,
  getPointToLayer,
  getStyle,
  sitgCrs,
  swisstopoCrs,
} from "@/utils/leaflet";
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
import { clone } from "lodash";
import { lookup } from "mime-types";
import proj4 from "proj4";
import "proj4leaflet";
import { Proj4GeoJSONFeature } from "proj4leaflet";
import { parseZip } from "shpjs";
import "vue-class-component/hooks";
import {
  Component,
  Prop,
  PropSync,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
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
  @PropSync("zoom", { type: Number, default: 5 })
  syncedZoom!: number;

  loading = false;
  fileLayers: MapFileLayer[] = [];
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
    proj4.defs("OGC:CRS84", proj4.defs("EPSG:4326"));
    proj4.defs("EPSG:21781", EPSG_21781);
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
    const promises: Promise<MapFileLayer>[] = this.items.map(async (item) => {
      const file = await this.getFile(item.asset);
      const style = item.styleUrl
        ? await (
            await axios.get(item.styleUrl, { responseType: "text" })
          ).data
        : undefined;
      return {
        ...item,
        file: file,
        style: style,
      } as MapFileLayer;
    });
    Promise.all(promises).then((layers) => (this.fileLayers = layers));
  }

  private async getFile(input: string | File): Promise<File> {
    if (typeof input === "string") {
      const url: string = input;
      const response = await axios.get(url, { responseType: "blob" });
      const mimeType = lookup(url);
      return new File([response.data], url.split("/").pop() ?? url, {
        type: mimeType || undefined,
      });
    } else {
      return Promise.resolve(input);
    }
  }

  @Watch("fileLayers")
  onFileLayersChanged(): void {
    const layers = clone(this.layers);
    const newIds: Set<string> = new Set(
      this.fileLayers.map((layer) => layer.id)
    );
    const oldIds: Set<string> = new Set(layers.map((layer) => layer.id));
    layers.forEach((layer) => {
      if (!newIds.has(layer.id)) {
        this.deleteLayer(layer.id);
      }
    });
    const newFileLayers: MapFileLayer[] = this.fileLayers.filter(
      (layer) => !oldIds.has(layer.id)
    );
    if (newFileLayers.length > 0) {
      this.addLayers(newFileLayers);
    }
  }

  addLayers(layers: MapFileLayer[]): void {
    if (layers.length > 0) {
      this.loading = true;
      const layerPromises: Promise<MapLayer>[] = layers.map((layer) => {
        const color: Color | undefined = layer.color;
        switch (layer.file.type) {
          case "image/tiff":
            return layer.file
              .arrayBuffer()
              .then((arrayBuffer) => parseGeoRaster(arrayBuffer))
              .then((georaster: ExtendedGeoRaster) => {
                if (color && georaster.mins[0] === 0) {
                  georaster.noDataValue = 0;
                }
                const colorScale: ColorScale | undefined = color
                  ? {
                      colorMin: color.lighten5,
                      colorMax: color.darken4,
                      valueMin: georaster.mins[0],
                      valueMax: georaster.maxs[0],
                    }
                  : undefined;
                return {
                  id: layer.id,
                  name: layer.file.name,
                  color: color,
                  layer: new GeoRasterLayer({
                    georaster: georaster,
                    pixelValuesToColorFn: colorScale
                      ? (values) => {
                          if (values[0] === georaster.noDataValue) {
                            return colors.shades.transparent;
                          }
                          const palette = interpolate([
                            colorScale.colorMin,
                            colorScale.colorMax,
                          ]);
                          const value =
                            (values[0] - georaster.mins[0]) /
                            georaster.ranges[0];
                          return palette(value);
                        }
                      : undefined,
                    resolution: 128,
                  }),
                  colorScale: colorScale,
                };
              });
          case "application/x-zip-compressed":
            return layer.file
              .arrayBuffer()
              .then((arrayBuffer) => parseZip(arrayBuffer))
              .then((geojson) =>
                this.getGeoJsonLayer(
                  layer,
                  geojson as unknown as Proj4GeoJSONFeature,
                  color
                )
              );
        }
        const extension = layer.file.name.split(".").pop();
        switch (extension) {
          case "geojson":
          case "json":
            return layer.file
              .text()
              .then(JSON.parse)
              .then((json) => this.getGeoJsonLayer(layer, json, color));
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

  private getGeoJsonLayer(
    layer: MapFileLayer,
    json: Proj4GeoJSONFeature,
    color?: Color
  ): MapLayer {
    return {
      id: layer.id,
      name: layer.file.name,
      color: color,
      layer: Proj.geoJson(json, {
        onEachFeature: (feature, l) => {
          if (layer.popupKey && feature.properties) {
            const property = feature.properties[layer.popupKey];
            if (property) {
              l.bindPopup(property);
              l.on("mouseover", () => l.openPopup());
              l.on("mouseout", () => l.closePopup());
            }
          }
        },
        style: getStyle(layer.style),
        pointToLayer: getPointToLayer(layer.style),
      }),
    };
  }

  public moveLayerToFront(id: string): void {
    const [layer, index] = this.getLayer(id);
    layer.layer.bringToFront();
    this.layers.unshift(...this.layers.splice(index, 1));
  }

  public deleteLayer(id: string): void {
    const [layer, index] = this.getLayer(id);
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
  color?: Color;
  popupKey?: string;
  styleUrl?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  layer: GridLayer | GeoJSON;
  color?: Color;
  colorScale?: ColorScale;
}

interface ColorScale {
  colorMin: string;
  colorMax: string;
  valueMin: number;
  valueMax: number;
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

type MapFileLayer = MapItem & {
  file: File;
  style?: string;
};

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
