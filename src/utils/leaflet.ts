import { Feature, Point } from "geojson";
import {
  Bounds,
  circleMarker,
  CRS,
  LatLng,
  Layer,
  PathOptions,
  Proj,
  StyleFunction,
} from "leaflet";
import "proj4leaflet";
import { Color } from "vuetify/lib/util/colors";
import { DOMParser } from "xmldom";
import xpath from "xpath";

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

const select = xpath.useNamespaces({
  ogc: "http://www.opengis.net/ogc",
  se: "http://www.opengis.net/se",
});
// https://github.com/orfon/Leaflet.SLD/blob/master/leaflet.sld.js
const attributeNameMapping = new Map<string, keyof PathOptions>([
  ["fill", "fillColor"],
  ["fill-opacity", "fillOpacity"],
  ["stroke", "color"],
  ["stroke-dasharray", "dashArray"],
  ["stroke-linecap", "lineCap"],
  ["stroke-linejoin", "lineJoin"],
  ["stroke-opacity", "opacity"],
  ["stroke-width", "weight"],
]);
const operatorMapping = new Map<string, Operator>([
  ["PropertyIsEqualTo", "eq"],
  ["PropertyIsGreaterThan", "gt"],
  ["PropertyIsGreaterThanOrEqualTo", "ge"],
  ["PropertyIsLessThan", "lt"],
  ["PropertyIsLessThanOrEqualTo", "le"],
  ["PropertyIsNotEqualTo", "ne"],
]);

interface Rule {
  condition?: {
    filterUnion: "and" | "or";
    filters: Filter[];
  };
  options: PathOptions;
}

interface Filter {
  property: string;
  literal: number;
  operator: Operator;
}

type Operator = "eq" | "gt" | "ge" | "lt" | "le" | "ne";

const operatorExpression = Array.from(operatorMapping.keys())
  .map((name) => `./*/ogc:${name}`)
  .join(" | ");

export function getStyle(
  style?: string,
  color?: Color
): PathOptions | StyleFunction | undefined {
  if (style) {
    const doc = new DOMParser().parseFromString(style);
    const ruleNodes = select("//se:Rule", doc) as Node[];
    const rules: Rule[] = ruleNodes.map((ruleNode) => {
      const options: PathOptions = getPathOptions(
        "./*/*/se:SvgParameter",
        ruleNode
      );
      const filterNode = select("./ogc:Filter", ruleNode, true) as
        | Element
        | undefined;
      if (filterNode) {
        const filters: Filter[] = (
          select(operatorExpression, filterNode) as Element[]
        ).map((node) => {
          const property = getText("./ogc:PropertyName", node);
          const literal = getNumber("./ogc:Literal", node);
          if (!property) {
            throw "Expected ogc:PropertyName";
          }
          if (!literal) {
            throw "Expected ogc:Literal";
          }
          const operator = operatorMapping.get(node.localName);
          if (!operator) {
            throw `Unknown operator ${node.localName}`;
          }
          return {
            property: property,
            literal: literal,
            operator: operator,
          };
        });
        if (select("./ogc:And", filterNode, true)) {
          return {
            condition: {
              filterUnion: "and",
              filters: filters,
            },
            options: options,
          };
        }
        if (select("./ogc:Or", filterNode, true)) {
          return {
            condition: {
              filterUnion: "or",
              filters: filters,
            },
            options: options,
          };
        }
      }
      return {
        options: options,
      };
    });
    return (feature) => {
      if (!feature) {
        return {};
      }
      return (
        rules.find((rule) => {
          const condition = rule.condition;
          if (!condition) {
            return true;
          }
          return condition.filters
            .map((filter) => {
              const property = feature.properties[filter.property];
              switch (filter.operator) {
                case "eq":
                  return property == filter.literal;
                case "gt":
                  return property > filter.literal;
                case "ge":
                  return property >= filter.literal;
                case "lt":
                  return property < filter.literal;
                case "le":
                  return property <= filter.literal;
                case "ne":
                  return property != filter.literal;
              }
            })
            .reduce((a, b) => {
              switch (condition.filterUnion) {
                case "and":
                  return a && b;
                case "or":
                  return a || b;
              }
            });
        })?.options ?? {}
      );
    };
  } else if (color) {
    return {
      color: color.base,
    };
  }
  return undefined;
}

function getText(expression: string, node: Node): string | undefined {
  return (
    (select(expression + "/text()", node, true) as Text | undefined)
      ?.nodeValue ?? undefined
  );
}

function getNumber(expression: string, node: Node): number | undefined {
  const text = getText(expression, node);
  return text === undefined ? undefined : Number(text);
}

function getPathOptions(expression: string, node: Node): PathOptions {
  return Object.fromEntries(
    (select(expression, node) as Element[])
      .map((element) => {
        const name = element.getAttribute("name");
        const key = name ? attributeNameMapping.get(name) : undefined;
        return [key, element.firstChild?.nodeValue ?? undefined];
      })
      .filter((entry) => entry[0] !== undefined)
  );
}

type PointToLayer = (geoJsonPoint: Feature<Point>, latlng: LatLng) => Layer;

export function getPointToLayer(style?: string): PointToLayer | undefined {
  if (style) {
    const doc = new DOMParser().parseFromString(style);
    // TODO: rule filter ?
    const graphicNode = select("//se:Graphic", doc, true) as Node;
    if (graphicNode) {
      const options: PathOptions = getPathOptions(
        "./*/*/se:SvgParameter",
        graphicNode
      );
      switch (getText("./se:Mark/se:WellKnownName", graphicNode)) {
        case "circle":
          return (_, latlng) =>
            circleMarker(latlng, {
              ...options,
              radius: getNumber("./se:Size", graphicNode),
            });
      }
    }
  }
  return undefined;
}
