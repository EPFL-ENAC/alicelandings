export interface Metadata {
  name: string;
  layers: {
    title: string;
    geojson: string;
    sld: string;
  }[];
}
