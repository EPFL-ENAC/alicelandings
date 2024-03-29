import { DOMParser } from "@xmldom/xmldom";
import { Feature, Point } from "geojson";
import L, {
  circleMarker,
  CircleMarkerOptions,
  divIcon,
  LatLng,
  Layer,
  LeafletEvent,
  LeafletEventHandlerFn,
  marker,
  PathOptions,
  Pattern,
  PatternCircle,
  StripePattern,
  StyleFunction,
} from "leaflet";
import "leaflet.pattern";
import { round } from "lodash";
import "proj4leaflet";
import { colors } from "vuetify/lib";
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
  ["PropertyIsGreaterThan", (p, l) => p > (l as number)],
  ["PropertyIsGreaterThanOrEqualTo", (p, l) => p >= (l as number)],
  ["PropertyIsLessThan", (p, l) => p < (l as number)],
  ["PropertyIsLessThanOrEqualTo", (p, l) => p <= (l as number)],
  ["PropertyIsNotEqualTo", (p, l) => p !== l],
  ["PropertyIsNull", (p) => p == undefined],
]);

type Operator = (p: number, l: number | string | undefined) => boolean;

interface Rule {
  condition?: {
    filterReducer: (a: boolean, b: boolean) => boolean;
    filters: Filter[];
  };
  options: PathOptions;
}

interface Filter {
  property: string;
  literal: number | string | undefined;
  operator: Operator;
}

const operatorExpression = Array.from(operatorMapping.keys())
  .map((name) => `./*/ogc:${name}`)
  .join(" | ");

const noOptions: PathOptions = {
  color: colors.shades.transparent,
  stroke: false,
};

export function getStyle(style?: string): {
  style?: PathOptions | StyleFunction;
  onAdd?: LeafletEventHandlerFn;
  onRemove?: LeafletEventHandlerFn;
} {
  if (style) {
    const doc = new DOMParser().parseFromString(style);
    const ruleNodes = select("//se:Rule", doc) as Node[];
    const patterns: Pattern[] = [];
    const rules: Rule[] = ruleNodes.map((ruleNode) => {
      const { pathOptions, pattern } = getPathOptions(ruleNode);
      if (pattern) {
        patterns.push(pattern);
      }
      const filterNode = select("./ogc:Filter", ruleNode, true) as
        | Element
        | undefined;
      if (filterNode) {
        const filters: Filter[] = (
          select(operatorExpression, filterNode) as Element[]
        ).map((node) => {
          const property = getText("./ogc:PropertyName", node);
          const literal = getNumberOrText("./ogc:Literal", node);
          if (!property) {
            throw Error("Expected ogc:PropertyName");
          }
          const operator = operatorMapping.get(node.localName);
          if (!operator) {
            throw Error(`Unknown operator ${node.localName}`);
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
            options: pathOptions,
          };
        }
        if (select("./ogc:Or", filterNode, true)) {
          return {
            condition: {
              filterReducer: (a, b) => a || b,
              filters: filters,
            },
            options: pathOptions,
          };
        }
      }
      return {
        options: pathOptions,
      };
    });
    return {
      style: (feature) => {
        if (!feature) {
          return noOptions;
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
                if (property == null) {
                  return false;
                } else {
                  return filter.operator(property, filter.literal);
                }
              })
              .reduce(condition.filterReducer);
          })?.options ?? noOptions
        );
      },
      onAdd: patterns
        ? (event: LeafletEvent) => {
            const map: L.Map = event.target._map;
            patterns.forEach((pattern) => pattern.addTo(map));
          }
        : undefined,
      onRemove: patterns
        ? (event: LeafletEvent) => {
            const map: L.Map = event.target._map;
            patterns.forEach((pattern) => pattern.removeFrom(map));
          }
        : undefined,
    };
  }
  return {};
}

function getText(expression: string, node: Node): string | undefined {
  return (
    (select(`${expression}/text()`, node, true) as Text | undefined)
      ?.nodeValue ?? undefined
  );
}

function getNumber(expression: string, node: Node): number | undefined {
  const text = getText(expression, node);
  return text === undefined ? undefined : Number(text);
}

function getNumberOrText(
  expression: string,
  node: Node
): number | string | undefined {
  const text = getText(expression, node);
  return text === undefined ? undefined : Number(text) ?? text;
}

function getPathOptions(ruleNode: Node): {
  pathOptions: PathOptions;
  pattern?: Pattern;
} {
  const symbolizerNode = select(
    "./se:PolygonSymbolizer | ./se:LineSymbolizer",
    ruleNode,
    true
  ) as Node;
  if (!symbolizerNode) {
    // skip PointSymbolizer
    return {
      pathOptions: noOptions,
    };
  }
  const graphicNode = select(
    "./se:Fill/se:GraphicFill/se:Graphic",
    symbolizerNode,
    true
  ) as Node;
  if (graphicNode) {
    const wellKnownName = getText("./se:Mark/se:WellKnownName", graphicNode);
    switch (wellKnownName) {
      case "circle": {
        const size = getNumber("./se:Size", graphicNode) ?? 1;
        const fillColor = getText(
          "./se:Mark/se:Fill/se:SvgParameter[@name='fill']",
          graphicNode
        );
        const color = getText(
          "./se:Mark/se:Stroke/se:SvgParameter[@name='stroke']",
          graphicNode
        );
        const weight = getNumber(
          "./se:Mark/se:Stroke/se:SvgParameter[@name='stroke-width']",
          graphicNode
        );
        const roundSize = size / 1.5;
        const roundDistance = 1;
        const circleOffset = roundSize + 2;
        const shape = new PatternCircle({
          x: circleOffset,
          y: circleOffset,
          radius: roundSize,
          color: color,
          fill: true,
          fillColor: fillColor,
          fillOpacity: 1,
          weight: weight,
        });
        const patternSize = (roundSize + roundDistance) * 2;
        const pattern = new Pattern({
          width: patternSize,
          height: patternSize,
        });
        pattern.addShape(shape);
        return {
          pathOptions: {
            fillPattern: pattern,
            stroke: false,
          },
          pattern: pattern,
        };
      }
      case "horline": {
        const color = getText(
          "./se:Mark/se:Stroke/se:SvgParameter[@name='stroke']",
          graphicNode
        );
        const rotation = getNumber("./se:Rotation/ogc:Literal", graphicNode);
        const weight = getNumber(
          "./se:Mark/se:Stroke/se:SvgParameter[@name='stroke-width']",
          graphicNode
        );
        const pattern = new StripePattern({
          angle: ratio(rotation, -1),
          color: color,
          weight: ratio(weight, 1 / 4),
        });
        return {
          pathOptions: {
            fillPattern: pattern,
            stroke: false,
          },
          pattern: pattern,
        };
      }
      default:
        throw Error(`Unknown pattern WellKnownName ${wellKnownName}`);
    }
  } else {
    return {
      pathOptions: getSvgParameterPathOptions(
        "./*/se:SvgParameter",
        symbolizerNode
      ),
    };
  }
}

function getSvgParameterPathOptions(
  expression: string,
  node: Node
): PathOptions {
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

function getObject(expression: string, node: Node): Record<string, string> {
  return Object.fromEntries(
    (select(expression, node) as Element[])
      .map((element) => {
        const name = element.getAttribute("name");
        const value = element.firstChild?.nodeValue;
        return [name, value];
      })
      .filter(([key, value]) => key != null && value != null)
  );
}

type PointToLayer = (geoJsonPoint: Feature<Point>, latlng: LatLng) => Layer;

function ratio(value?: number, ratio = 1 / 2.5): number | undefined {
  if (value === undefined) {
    return undefined;
  } else {
    return value * ratio;
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
      return Number(value) / 3.5;
    default:
      return value;
  }
}

export function getPointToLayer(
  style: string,
  options?: PathOptions
): PointToLayer | undefined {
  const doc = new DOMParser().parseFromString(style);
  // TODO: rule filter ?
  const graphicNode = select(
    "//se:PointSymbolizer/se:Graphic",
    doc,
    true
  ) as Node;
  if (graphicNode) {
    const pathOptions: PathOptions = getSvgParameterPathOptions(
      "./se:Mark/*/se:SvgParameter",
      graphicNode
    );
    const wellKnownName = getText("./se:Mark/se:WellKnownName", graphicNode);
    switch (wellKnownName) {
      case "circle": {
        const circleMarkerOptions: CircleMarkerOptions = {
          ...pathOptions,
          radius: ratio(getNumber("./se:Size", graphicNode)),
          ...options,
        };
        return (_, latlng) => circleMarker(latlng, circleMarkerOptions);
      }
      default:
        throw Error(`Unknown wellKnownName ${wellKnownName}`);
    }
  }
  const textSymbolizerNode = select("//se:TextSymbolizer", doc, true) as Node;
  if (textSymbolizerNode) {
    const property = getText("./se:Label/ogc:PropertyName", textSymbolizerNode);
    if (property) {
      const color = getText("./se:Fill/se:SvgParameter", textSymbolizerNode);
      const font = getObject("./se:Font/se:SvgParameter", textSymbolizerNode);
      if (font["font-size"] !== undefined) {
        font["font-size"] = `${round(Number(font["font-size"]) * 0.8)}px`;
      }
      const style: Record<string, string | undefined> = {
        color: color,
        ...font,
      };
      const styleText = Object.entries(style)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}:${value};`)
        .join("");
      return (geoJsonPoint, latlng) => {
        const properties = geoJsonPoint.properties;
        if (properties) {
          const text: string = properties[property];
          return marker(latlng, {
            opacity: 0,
            icon: divIcon({
              iconSize: [0, 0],
            }),
          }).bindTooltip(`<div style='${styleText}'>${text}</div>`, {
            className: "text-point-tooltip",
            direction: "center",
            permanent: true,
          });
        } else {
          return marker(latlng);
        }
      };
    }
  }
}
