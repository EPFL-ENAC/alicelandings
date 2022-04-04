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
import { EPSG_2056, EPSG_21781, sitgCrs, TileLayerProp } from "@/utils/leaflet";
import { getPointToLayer, getStyle } from "@/utils/leaflet-sld";
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
  LayerGroup,
  LeafletMouseEvent,
  Map,
  MapOptions,
  Proj,
  TileLayer,
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
  readonly baseTileLayers: TileLayerProps[] = [
    {
      name: "None",
      url: "",
      visible: true,
      options: {
        crs: CRS.EPSG3857,
        maxZoom: 19,
      },
    },
    {
      name: "SITG",
      visible: false,
      attribution:
        '&copy; <a target="_blank" href="https://ge.ch/sitg/">SITG</a>',
      url: "https://ge.ch/sitgags2/rest/services/RASTER/PLAN_SITG/MapServer/WMTS/tile/1.0.0/RASTER_PLAN_SITG/default/default028mm/{z}/{y}/{x}.png",
      options: {
        crs: sitgCrs,
        maxZoom: 11,
      },
    },
  ];
  readonly defaultCrs = CRS.EPSG3857;

  @Ref()
  readonly lMap!: LMap;

  @Prop({ type: Array as () => number[] })
  readonly center!: [number, number];
  @Prop({ type: Array as () => string[], default: () => [] })
  readonly dems!: string[];
  @Prop({ type: Array as () => MapGroupItem[], default: () => [] })
  readonly items!: MapGroupItem[];
  @Prop({ type: Number, default: 0 })
  readonly minZoom!: number;
  @Prop({ type: Number, default: 19 })
  readonly maxZoom!: number;
  @PropSync("zoom", { type: Number, default: 11 })
  syncedZoom!: number;

  loading = false;
  layers: MapLayer[] = [];
  demGeorasters: GeoRaster[] = [];
  crs: CRS =
    this.baseTileLayers.find((layer) => layer.visible)?.options?.crs ??
    this.defaultCrs;

  get map(): Map {
    return this.lMap.mapObject;
  }

  get mapOptions(): MapOptions {
    return {
      zoomControl: false,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
    };
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
          const altitudePromise: Promise<number | undefined> = Promise.all(
            this.demGeorasters.map((georaster) =>
              identify(georaster, [point.x, point.y])
            )
          ).then((altitudes) => {
            return altitudes.flat().find((value) => value); // defined && !== 0
          });
          const positionText = `Lat/Lon:
          (${e.latlng.lat.toFixed(4)}; ${e.latlng.lng.toFixed(4)})`;
          altitudePromise.then((altitude) => {
            container.innerHTML =
              altitude !== undefined
                ? [`Altitude: ${altitude.toFixed(0)} m`, positionText].join(
                    "<br>"
                  )
                : positionText;
          });
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
        this.defaultCrs;
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
      parseGeoRaster(dem).then((georaster: GeoRaster) => {
        this.demGeorasters.push(georaster);
      });
    });
  }

  @Watch("items")
  onItemsChanged(): void {
    const newIds: Set<string> = new Set(this.items.map((item) => item.id));
    const oldIds: Set<string> = new Set(this.layers.map((layer) => layer.id));
    clone(this.layers).forEach((layer) => {
      if (!newIds.has(layer.id)) {
        this.deleteLayer(layer.id);
      }
    });
    this.items
      .filter((item) => oldIds.has(item.id))
      .forEach((item) => {
        this.getLayer(item.id)[0].layerGroup.setZIndex(item.zIndex);
      });
    const newItems: MapGroupItem[] = this.items.filter(
      (item) => !oldIds.has(item.id)
    );
    if (newItems.length > 0) {
      this.loading = true;
      const promises: Promise<void>[] = newItems.map(async (item) => {
        const layerGroup: LayerGroup = new LayerGroup();
        layerGroup.setZIndex(item.zIndex);
        item.children.forEach((itemLayer) =>
          itemLayer.getLayer().then((layer) => {
            layer.setZIndex(item.zIndex);
            layerGroup.addLayer(layer);
          })
        );
        this.map.addLayer(layerGroup);
        const mapLayer = new MapLayer(item.id, item.id, layerGroup);
        this.layers.unshift(mapLayer);
      });
      Promise.allSettled(promises).finally(() => {
        this.loading = false;
      });
    }
  }

  /**
   * @deprecated use zIndex
   */
  public moveLayerToFront(id: string): void {
    const [layer, index] = this.getLayer(id);
    layer.layers.forEach((layer) => layer.bringToFront());
    this.layers.unshift(...this.layers.splice(index, 1));
  }

  public deleteLayer(id: string): void {
    const [layer, index] = this.getLayer(id);
    this.map.removeLayer(layer.layerGroup);
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

export interface MapGroupItem {
  id: string;
  zIndex: number;
  children: MapItem[];
}

interface MapItemOption {
  color?: Color;
  popupKey?: string;
  styleUrl?: string;
}

abstract class MapItem {
  constructor(protected option?: MapItemOption) {}

  get color(): Color | undefined {
    return this.option?.color;
  }

  get popupKey(): string | undefined {
    return this.option?.popupKey;
  }

  async style(): Promise<string | undefined> {
    return this.option?.styleUrl
      ? await (
          await axios.get(this.option?.styleUrl, { responseType: "text" })
        ).data
      : undefined;
  }

  abstract get mimeType(): string;
  abstract get filename(): string;
  abstract arrayBuffer(): Promise<ArrayBuffer>;
  abstract geoRaster(): Promise<ExtendedGeoRaster>;
  abstract json(): Promise<Proj4GeoJSONFeature>;

  private async getGeoJsonLayer(
    json: Proj4GeoJSONFeature
  ): Promise<LeafletLayer> {
    const popupKey = this.popupKey;
    const styleText: string | undefined = await this.style();
    const { style, onAdd, onRemove } = getStyle(styleText);
    const geoJson = Proj.geoJson(json, {
      onEachFeature: popupKey
        ? (feature, l) => {
            if (feature.properties) {
              const property = feature.properties[popupKey];
              if (property) {
                l.bindPopup(property);
                l.on("mouseover", () => l.openPopup());
                l.on("mouseout", () => l.closePopup());
              }
            }
          }
        : undefined,
      style: style,
      pointToLayer: getPointToLayer(styleText),
    });
    if (onAdd) {
      return geoJson.on("add", onAdd);
    }
    if (onRemove) {
      return geoJson.on("remove", onRemove);
    }
    return geoJson;
  }

  async getLayer(): Promise<LeafletLayer> {
    const color: Color | undefined = this.color;
    switch (this.mimeType) {
      case "image/tiff":
        return this.geoRaster().then((georaster: ExtendedGeoRaster) => {
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
          return new GeoRasterLayer({
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
                    (values[0] - georaster.mins[0]) / georaster.ranges[0];
                  return palette(value);
                }
              : undefined,
            resolution: 128,
          });
        });
      case "application/x-zip-compressed":
        return this.arrayBuffer()
          .then((arrayBuffer) => parseZip(arrayBuffer))
          .then((geojson) =>
            this.getGeoJsonLayer(geojson as unknown as Proj4GeoJSONFeature)
          );
    }
    const extension = this.filename.split(".").pop();
    switch (extension) {
      case "geojson":
      case "json":
        return this.json().then((json) => this.getGeoJsonLayer(json));
    }
    return Promise.reject(
      `unsupported type ${this.mimeType} for file ${this.filename}`
    );
  }
}

export class FileMapItem extends MapItem {
  constructor(public file: File, option?: MapItemOption) {
    super(option);
  }

  get mimeType(): string {
    return this.file.type;
  }

  get filename(): string {
    return this.file.name;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.file.arrayBuffer();
  }

  async geoRaster(): Promise<ExtendedGeoRaster> {
    const arrayBuffer: ArrayBuffer = await this.file.arrayBuffer();
    return parseGeoRaster(arrayBuffer);
  }

  async json(): Promise<Proj4GeoJSONFeature> {
    const text = await this.file.text();
    return JSON.parse(text);
  }
}

export class UrlMapItem extends MapItem {
  constructor(public url: string, option?: MapItemOption) {
    super(option);
  }

  get mimeType(): string {
    const type = lookup(this.url);
    return type ? type : "";
  }

  get filename(): string {
    return this.url;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const response = await axios.get(this.url, {
      responseType: "arraybuffer",
    });
    return response.data;
  }

  geoRaster(): Promise<ExtendedGeoRaster> {
    return parseGeoRaster(this.url);
  }

  async json(): Promise<Proj4GeoJSONFeature> {
    const response = await axios.get(this.url, {
      responseType: "json",
    });
    return response.data;
  }
}

export class TileMapItem extends UrlMapItem {
  constructor(public prop: TileLayerProp) {
    super(prop.urlTemplate);
  }

  async getLayer(): Promise<LeafletLayer> {
    return new TileLayer(this.prop.urlTemplate, this.prop.options);
  }
}

export class MapLayer {
  constructor(
    public id: string,
    public name: string,
    public layerGroup: LayerGroup
  ) {}

  get layers(): LeafletLayer[] {
    return this.layerGroup.getLayers() as LeafletLayer[];
  }
}

type LeafletLayer = GridLayer | GeoJSON | TileLayer;

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
