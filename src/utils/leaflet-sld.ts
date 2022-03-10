import { Feature, Point } from "geojson";
import {
  circleMarker,
  LatLng,
  Layer,
  marker,
  PathOptions,
  StyleFunction,
} from "leaflet";
import "proj4leaflet";
import { DOMParser } from "xmldom";
import xpath from "xpath";

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
  ["PropertyIsEqualTo", (p, l) => p === l],
  ["PropertyIsGreaterThan", (p, l) => p > l],
  ["PropertyIsGreaterThanOrEqualTo", (p, l) => p >= l],
  ["PropertyIsLessThan", (p, l) => p < l],
  ["PropertyIsLessThanOrEqualTo", (p, l) => p <= l],
  ["PropertyIsNotEqualTo", (p, l) => p !== l],
]);

type Operator = (p: number, l: number) => boolean;

interface Rule {
  condition?: {
    filterReducer: (a: boolean, b: boolean) => boolean;
    filters: Filter[];
  };
  options: PathOptions;
}

interface Filter {
  property: string;
  literal: number;
  operator: Operator;
}

const operatorExpression = Array.from(operatorMapping.keys())
  .map((name) => `./*/ogc:${name}`)
  .join(" | ");

export function getStyle(
  style?: string
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
              filterReducer: (a, b) => a && b,
              filters: filters,
            },
            options: options,
          };
        }
        if (select("./ogc:Or", filterNode, true)) {
          return {
            condition: {
              filterReducer: (a, b) => a || b,
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
            .map((filter) =>
              filter.operator(
                feature.properties[filter.property],
                filter.literal
              )
            )
            .reduce(condition.filterReducer);
        })?.options ?? {}
      );
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
  const pathOptions: PathOptions = Object.fromEntries(
    (select(expression, node) as Element[]).flatMap((element) => {
      const name = element.getAttribute("name");
      const key = name ? attributeNameMapping.get(name) : undefined;
      if (key) {
        const value = element.firstChild?.nodeValue ?? undefined;
        return [[key, castValue(key, value)]];
      } else {
        return [];
      }
    })
  );
  if (pathOptions.fillColor && pathOptions.fillOpacity === undefined) {
    pathOptions.fillOpacity = 1;
  }
  if (pathOptions.dashArray) {
    pathOptions.dashArray = (pathOptions.dashArray as number[]).map(
      (v) => v * (pathOptions.weight ?? 3) // https://leafletjs.com/SlavaUkraini/reference.html#path-weight
    );
  }
  return pathOptions;
}

type PointToLayer = (geoJsonPoint: Feature<Point>, latlng: LatLng) => Layer;

function ratio(value?: number): number | undefined {
  if (value === undefined) {
    return undefined;
  } else {
    return value / 2.5;
  }
}

function castValue(key: keyof PathOptions, value?: string): unknown {
  if (value === undefined) {
    return undefined;
  }
  switch (key) {
    case "dashArray":
      return value.split(" ").map((item) => Number(item));
    case "weight":
      return Number(value);
    default:
      return value;
  }
}

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
              radius: ratio(getNumber("./se:Size", graphicNode)),
            });
      }
    }
    const textSymbolizerNode = select("//se:TextSymbolizer", doc, true) as Node;
    if (textSymbolizerNode) {
      const property = getText(
        "./se:Label/ogc:PropertyName",
        textSymbolizerNode
      );
      if (property) {
        return (geoJsonPoint, latlng) => {
          const properties = geoJsonPoint.properties;
          if (properties) {
            return marker(latlng).bindTooltip(properties[property], {
              permanent: true,
            });
          } else {
            return marker(latlng);
          }
        };
      }
    }
  }
  return undefined;
}
