/**
 * https://github.com/Leaflet/Leaflet.heat
 */
export interface HeatLayerOptions {
  minOpacity?: number;
  maxZoom?: number;
  max?: number;
  radius?: number;
  blur?: number;
  gradient?: Record<number, string>;
}
