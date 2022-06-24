import {
  Bounds,
  Browser,
  Coords,
  CRS,
  DomUtil,
  GridLayer,
  LatLng,
  Point,
  Proj,
  TileLayer,
  TileLayerOptions,
  ZoomAnimEvent,
} from "leaflet";
import { range } from "lodash";
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
  | "swisstopo_photo"
  | "swisstopo_pixelkarte_farbe_2056"
  | "swisstopo_photo_2056",
  TileLayerProp
> = {
  openStreetMap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
  },
  swisstopo_pixelkarte_farbe: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_pixelkarte_grau: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_landeskarte_farbe: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-farbe-10/default/current/3857/{z}/{x}/{y}.png",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_landeskarte_grau: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-grau-10/default/current/3857/{z}/{x}/{y}.png",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_photo: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/3857/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 19, // 20
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_pixelkarte_farbe_2056: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 27,
      subdomains: swisstopoSubdomains,
    },
  },
  swisstopo_photo_2056: {
    url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage-product/default/current/2056/{z}/{x}/{y}.jpeg",
    options: {
      attribution: swisstopoAttribution,
      maxZoom: 27,
      subdomains: swisstopoSubdomains,
    },
  },
};

export interface TileLayerProp {
  url: string;
  options?: TileLayerOptions;
}

declare module "leaflet" {
  /**
   * https://github.com/Leaflet/Leaflet/blob/v1.7.1/src/map/Map.js
   */
  interface Map {
    _getNewPixelOrigin(center: LatLng, zoom: number): Point;
    _getMapPanePos(): Point;
  }

  /**
   * https://github.com/Leaflet/Leaflet/blob/v1.7.1/src/layer/tile/GridLayer.js
   */
  interface GridLayer {
    _level: Level;
    _levels: Record<number, Level>;

    _getTiledPixelBounds(center: LatLng): Bounds;
    _getTilePos(coords: Coords): Point;
    _updateLevels(): Level | undefined;
    _tileCoordsToNwSe(coords: Coords): [LatLng, LatLng];
    _setView(
      center: LatLng,
      zoom: number,
      noPrune: boolean,
      noUpdate: boolean
    ): void;
    _clampZoom(zoom: number): number;
    _setZoomTransform(level: Level, center: LatLng, zoom: number): void;
    _isValidTile(coords: Coords): boolean;
    _pxBoundsToTileRange(bounds: Bounds): Bounds;
    _noTilesToLoad(): boolean;
    _pruneTiles(): void;
    _removeAllTiles(): void;
    _invalidateAll(): void;
    _retainParent(x: number, y: number, z: number, minZoom: number): boolean;
    _retainChildren(x: number, y: number, z: number, minZoom: number): void;
    _removeTile(key: string): void;
    _resetView(): void;
    _animateZoom(e: ZoomAnimEvent): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Proj {
    interface CRS {
      options: Proj.ProjCRSOptions;
    }
  }
}

interface Level {
  el: HTMLElement;
  origin: Point;
  zoom: number;
}

/**
 * https://en.wikipedia.org/wiki/World_file
 */
export class RasterTileLayer extends TileLayer {
  private tileSizeScale = 1;

  constructor(
    urlTemplate: string,
    public crs: Proj.CRS,
    options?: TileLayerOptions
  ) {
    super(urlTemplate, options);
  }

  get tileZoom(): number {
    return this.getTileZoom() ?? this._map.getZoom();
  }

  get minZoom(): number {
    if (this.options.minZoom === undefined) {
      throw new Error("minZoom should be defined");
    }
    return this.options.minZoom;
  }

  get maxZoom(): number {
    if (this.options.maxZoom === undefined) {
      throw new Error("maxZoom should be defined");
    }
    return this.options.maxZoom;
  }

  get mapCrs(): CRS {
    if (this._map.options.crs === undefined) {
      throw new Error("map should have crs");
    }
    return this._map.options.crs;
  }

  _animateZoom(): void {
    // no zoom animation
    this._removeAllTiles();
  }

  _getTiledPixelBounds(): Bounds {
    const tileSize = this.getTileSize();
    const bounds = new Bounds(
      this.crs
        .latLngToPoint(this._map.getBounds().getNorthWest(), this.tileZoom)
        .subtract(tileSize),
      this.crs
        .latLngToPoint(this._map.getBounds().getSouthEast(), this.tileZoom)
        .add(tileSize)
    );
    return bounds;
  }

  _getTilePos(coords: Coords): Point {
    const latLng = this.crs.unproject(
      this.crs.transformation.untransform(
        coords.scaleBy(super.getTileSize()),
        this.crs.scale(this.tileZoom)
      )
    );
    const pos = this._map.latLngToLayerPoint(latLng);
    return pos;
  }

  getTileSize(): Point {
    const size = super.getTileSize().multiplyBy(this.tileSizeScale).round();
    return size;
  }

  // createTile(coords: Coords): HTMLElement {
  //   const tile = document.createElement("div");
  //   const pos = this._getTilePos(coords);
  //   const latLng = this._map.layerPointToLatLng(pos);
  //   tile.innerHTML =
  //     [coords.x, coords.y, coords.z].join(", ") +
  //     "<br>" +
  //     [pos.x, pos.y, this._tileZoom].join(", ") +
  //     "<br>" +
  //     [latLng.lat, latLng.lng].join(", ");
  //   tile.style.outline = "1px solid blue";
  //   return tile;
  // }

  _updateLevels(): Level | undefined {
    this._removeAllTiles();
    return super._updateLevels();
  }

  private getTileZoom(): number {
    const mapScale: number = this.mapCrs.scale(this._map.getZoom());
    let bestZoom = this.minZoom;
    let bestDiff = Math.abs(mapScale - this.crs.scale(bestZoom));
    range(this.minZoom + 1, this.maxZoom + 1).forEach((zoom) => {
      const diff = Math.abs(mapScale - this.crs.scale(zoom));
      if (diff < bestDiff) {
        bestZoom = zoom;
        bestDiff = diff;
      }
    });
    const zoom = bestZoom;
    this.tileSizeScale = mapScale / this.crs.scale(zoom);
    return zoom;
  }

  _clampZoom(): number {
    const newZoom = super._clampZoom(this.tileZoom);
    return newZoom;
  }

  _setView(
    center: LatLng,
    _: number,
    noPrune: boolean,
    noUpdate: boolean
  ): void {
    super._setView(center, this.tileZoom, noPrune, noUpdate);
  }

  /**
   * https://github.com/Leaflet/Leaflet/blob/v1.7.1/src/layer/tile/GridLayer.js#L591
   */
  _setZoomTransform(level: Level, center: LatLng): void {
    const translate: Point = this._map
      .latLngToLayerPoint(center)
      .subtract(this._map.getSize().divideBy(2))
      .add(this._map._getMapPanePos())
      .round();
    if (Browser.any3d) {
      DomUtil.setTransform(level.el, translate, 1);
    } else {
      DomUtil.setPosition(level.el, translate);
    }
  }

  _pxBoundsToTileRange(bounds: Bounds): Bounds {
    const tileSize = super.getTileSize();
    return new Bounds(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      bounds.min!.unscaleBy(tileSize).floor(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      bounds.max!.unscaleBy(tileSize).ceil().subtract([1, 1])
    );
  }

  _isValidTile(coords: Coords): boolean {
    if (!this.crs.infinite) {
      const projectedBounds = this.crs.getProjectedBounds(this.tileZoom);
      const _globalTileRange = this._pxBoundsToTileRange(
        new Bounds(
          projectedBounds.getTopLeft().round(),
          projectedBounds.getBottomRight().round()
        )
      );
      return _globalTileRange.contains(coords);
    }
    throw new Error("crs should be finite (has bounds)");
  }

  _tileCoordsToNwSe(coords: Coords): [LatLng, LatLng] {
    const [nw, se] = super._tileCoordsToNwSe(coords);
    console.debug(nw, se);
    return [nw, se];
  }

  /**
   * https://github.com/Leaflet/Leaflet/blob/v1.7.1/src/layer/tile/GridLayer.js#L411
   */
  _pruneTiles(): void {
    if (!this._map) {
      return;
    }

    let key, tile;

    const zoom = this.tileZoom;
    if (
      (this.options.maxZoom !== undefined && zoom > this.options.maxZoom) ||
      (this.options.minZoom !== undefined && zoom < this.options.minZoom)
    ) {
      this._removeAllTiles();
      return;
    }

    for (key in this._tiles) {
      tile = this._tiles[key];
      tile.retain = tile.current;
    }

    for (key in this._tiles) {
      tile = this._tiles[key];
      if (tile.current && !tile.active) {
        const coords = tile.coords;
        if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
          this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
        }
      }
    }

    for (key in this._tiles) {
      if (!this._tiles[key].retain) {
        this._removeTile(key);
      }
    }
  }
}

export class DebugLayer extends GridLayer {
  createTile(coords: Coords): HTMLElement {
    const tile = document.createElement("div");
    const pos = this._getTilePos(coords);
    const latLng = this._map.layerPointToLatLng(pos);
    tile.innerHTML =
      [coords.x, coords.y, coords.z].join(", ") +
      "<br>" +
      [pos.x, pos.y, this._tileZoom].join(", ") +
      "<br>" +
      [latLng.lat, latLng.lng].join(", ");
    tile.style.outline = "1px solid red";
    return tile;
  }
}
