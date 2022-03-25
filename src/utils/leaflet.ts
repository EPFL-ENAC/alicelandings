import { Bounds, CRS, Proj, TileLayerOptions } from "leaflet";
import "proj4leaflet";

// https://epsg.io/2056
export const EPSG_2056 =
  "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs";
// https://epsg.io/21781
export const EPSG_21781 =
  "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs";

// https://api3.geo.admin.ch/services/sdiservices.html#wmts
export const swisstopoCrs: CRS = new Proj.CRS("EPSG:2056", EPSG_2056, {
  resolutions: [
    4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
    1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25,
    0.1,
  ],
  // TopLeftCorner
  origin: [2420000, 1350000],
});
// https://api3.geo.admin.ch/services/sdiservices.html#gettile
export const swisstopoSubdomains = "0123456789";
export const swisstopoAttribution =
  '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>';

// https://ge.ch/sitgags2/rest/services/RASTER/PLAN_SITG/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
export const sitgCrs = new Proj.CRS("EPSG:2056", EPSG_2056, {
  // ScaleDenominator * 0.00028 (pixelSize) * 2
  resolutions: [
    270.93387520104, 135.46693760052, 67.73346880026, 33.86673440012,
    16.933367200064, 8.466683600032, 4.233341800016, 2.1166709000082,
    1.058335450004, 0.529167725002, 0.264583862501, 0.1322919312504,
  ],
  // TopLeftCorner
  origin: [2462122.1614179425, 1160775.6235000007],
  bounds: new Bounds(
    [2462122.1614179425, 1160775.6235000007],
    [2560958.361249998, 1084235.604167315]
  ),
});

export const tileLayerProps: Record<
  | "openStreetMap"
  | "swisstopo_pixelkarte_farbe"
  | "swisstopo_pixelkarte_grau"
  | "swisstopo_landeskarte_farbe"
  | "swisstopo_landeskarte_grau"
  | "swisstopo_photo",
  TileLayerProp
> = {
  openStreetMap: {
    urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
  },
  swisstopo_pixelkarte_farbe: {
    urlTemplate:
      "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_pixelkarte_grau: {
    urlTemplate:
      "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_landeskarte_farbe: {
    urlTemplate:
      "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-farbe-10/default/current/3857/{z}/{x}/{y}.png",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_landeskarte_grau: {
    urlTemplate:
      "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-grau-10/default/current/3857/{z}/{x}/{y}.png",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_photo: {
    urlTemplate:
      "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/3857/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19, // 20
      subdomains: swisstopoSubdomains,
    },
  },
};

export interface TileLayerProp {
  urlTemplate: string;
  options: TileLayerOptions;
}
