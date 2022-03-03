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
    (select(expression, node) as Element[])
      .map((element) => {
        const name = element.getAttribute("name");
        const key = name ? attributeNameMapping.get(name) : undefined;
        return [key, element.firstChild?.nodeValue ?? undefined];
      })
      .filter((entry) => entry[0] !== undefined)
  );
  if (pathOptions.fillColor && pathOptions.fillOpacity === undefined) {
    pathOptions.fillOpacity = 1;
  }
  return pathOptions;
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
