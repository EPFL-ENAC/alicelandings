import { HeatLayerOptions } from "@/plugins/leaflet-heat";
import { RasterTileLayer, TileLayerProp } from "@/utils/leaflet";
import { getPointToLayer, getStyle } from "@/utils/leaflet-sld";
import axios from "axios";
import interpolate from "color-interpolate";
import { Feature, FeatureCollection } from "geojson";
import parseGeoRaster from "georaster";
import GeoRasterLayer, { GeoRaster } from "georaster-layer-for-leaflet";
import L, {
  CRS,
  GeoJSON,
  GridLayer,
  icon,
  IconOptions,
  LayerGroup,
  marker,
  PathOptions,
  Proj,
  tileLayer,
  TileLayer,
  TileLayerOptions,
  WMSOptions,
} from "leaflet";
import "leaflet.browser.print/dist/leaflet.browser.print.min.js";
import "leaflet.heat";
import { lookup } from "mime-types";
import "proj4leaflet";
import { Proj4GeoJSONFeature } from "proj4leaflet";
import { parseZip } from "shpjs";
import colors, { Color } from "vuetify/lib/util/colors";

export interface MapGroupItem {
  id: string;
  zIndex: number;
  children: MapItem[];
}

interface MapItemOption {
  color?: Color;
  popup?: string | ((properties: Record<string, string>) => string | undefined);
  styleUrl?: string;
  pathOptions?: PathOptions;
  getIconOptions?: (feature: Feature) => IconOptions;
}

export abstract class MapItem {
  constructor(protected option?: MapItemOption) {}

  get color(): Color | undefined {
    return this.option?.color;
  }

  get popup():
    | string
    | ((properties: Record<string, string>) => string | undefined)
    | undefined {
    return this.option?.popup;
  }

  get getIconOptions(): ((feature: Feature) => IconOptions) | undefined {
    return this.option?.getIconOptions;
  }

  async style(): Promise<string | undefined> {
    if (this.option?.styleUrl) {
      try {
        return await (
          await axios.get(this.option?.styleUrl, { responseType: "text" })
        ).data;
      } catch (e) {
        console.debug(e);
      }
    }
    return undefined;
  }

  abstract get mimeType(): string;
  abstract get filename(): string;
  abstract arrayBuffer(): Promise<ArrayBuffer>;
  abstract geoRaster(): Promise<ExtendedGeoRaster>;
  abstract json<T>(): Promise<T>;

  async getGeoJsonLayer(json: Proj4GeoJSONFeature): Promise<LeafletLayer> {
    const popup = this.popup;
    const styleText: string | undefined = await this.style();
    const { style, onAdd, onRemove } = getStyle(styleText);
    const getIconOptions = this.getIconOptions;
    const geoJson = Proj.geoJson(json, {
      onEachFeature: popup
        ? (feature, l) => {
            if (feature.properties) {
              const property: string | undefined =
                typeof popup === "string"
                  ? feature.properties[popup]
                  : popup(feature.properties);
              if (property) {
                l.bindPopup(property.replaceAll("\n", "<br>"), {
                  autoPan: false,
                });
                l.on("mouseover", () => l.openPopup());
                l.on("mouseout", () => l.closePopup());
              }
            }
          }
        : undefined,
      style: style,
      pointToLayer: getIconOptions
        ? (feature: Feature, latlng) =>
            marker(latlng, {
              icon: icon(getIconOptions(feature)),
            })
        : styleText
        ? getPointToLayer(styleText, this.option?.pathOptions)
        : undefined,
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
      case "application/zip":
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
        return this.json<Proj4GeoJSONFeature>().then((json) =>
          this.getGeoJsonLayer(json)
        );
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

  async json<T>(): Promise<T> {
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

  async json<T>(): Promise<T> {
    const response = await axios.get(this.url, {
      responseType: "json",
    });
    return response.data;
  }
}

export class TileMapItem extends UrlMapItem {
  constructor(
    url: string,
    private options?: TileLayerOptions,
    private crs?: Proj.CRS
  ) {
    super(url);
  }

  async getLayer(): Promise<LeafletLayer> {
    if (this.crs) {
      return new RasterTileLayer(this.url, this.crs, this.options);
    } else {
      return new TileLayer(this.url, this.options);
    }
  }
}

export class WmsMapItem extends UrlMapItem {
  constructor(url: string, private options: WMSOptions) {
    super(url);
  }

  async getLayer(): Promise<LeafletLayer> {
    return tileLayer.wms(this.url, this.options);
  }
}

export class HeatmapMapItem extends UrlMapItem {
  constructor(
    geojsonUrl: string,
    private latitude = "lat",
    private longitude = "lng",
    private options?: HeatLayerOptions
  ) {
    super(geojsonUrl);
  }

  async getLayer(): Promise<LeafletLayer> {
    const json = await this.json<FeatureCollection>();
    const points = json.features
      .map((feature) =>
        feature.properties
          ? [
              feature.properties[this.latitude],
              feature.properties[this.longitude],
              5,
            ]
          : undefined
      )
      .filter((point) => point !== undefined);
    // https://github.com/Leaflet/Leaflet.heat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (L as any).heatLayer(points, this.options);
  }
}

export class MapLayer {
  constructor(
    public id: string,
    public name: string,
    public layerGroup: LayerGroup,
    public zIndex: number,
    public colorScale?: ColorScale
  ) {}

  get layers(): LeafletLayer[] {
    return this.layerGroup.getLayers() as LeafletLayer[];
  }
}

export interface BaseLayer extends TileLayerProp {
  name: string;
  visible: boolean;
  crs?: CRS;
}

type LeafletLayer = GridLayer | GeoJSON | TileLayer;

interface ColorScale {
  colorMin: string;
  colorMax: string;
  valueMin: number;
  valueMax: number;
}

interface ExtendedGeoRaster extends GeoRaster {
  mins: number[];
  maxs: number[];
  ranges: number[];
}
