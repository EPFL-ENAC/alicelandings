<script setup lang="ts">
import { EPSG_2056, EPSG_21781 } from "@/utils/leaflet";
import { BaseLayer, MapGroupItem, MapLayer } from "@/utils/webMap";
import { identify } from "geoblaze";
import parseGeoRaster from "georaster";
import GeoRasterLayer, { GeoRaster } from "georaster-layer-for-leaflet";
import {
  Control,
  control,
  CRS,
  DomUtil,
  Layer,
  LayerEvent,
  LayerGroup,
  LeafletMouseEvent,
  Map,
  tileLayer,
  TileLayerOptions,
} from "leaflet";
import "leaflet.browser.print/dist/leaflet.browser.print.min.js";
import "leaflet.heat";
import { clone, sortBy } from "lodash";
import proj4 from "proj4";
import "proj4leaflet";
import { concat, from, Subscription } from "rxjs";
import { first, map } from "rxjs/operators";
import {
  computed,
  defineExpose,
  defineProps,
  onMounted,
  ref,
  watch,
  withDefaults,
} from "vue";

const props = withDefaults(
  defineProps<{
    defaultCrs?: CRS;
    baseLayers?: BaseLayer[];
    center?: [number, number];
    dems?: string[];
    items?: MapGroupItem[];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    printable?: boolean;
  }>(),
  {
    defaultCrs: () => CRS.EPSG3857,
    baseLayers: () => [],
    center: () => [0, 0],
    dems: () => [],
    items: () => [],
    zoom: 11,
    minZoom: undefined,
    maxZoom: undefined,
    printable: false,
  }
);
defineExpose({ deleteLayer, getLayers, moveLayerToFront });

let leafletMap: Map | undefined = undefined;

const selectedCrs = ref<CRS>();
const loading = ref<boolean>(false);
const layers = ref<MapLayer[]>([]);
const demGeorasters = ref<GeoRaster[]>([]);
const mousemoveSubscription = ref<Subscription>();

const crs = computed<CRS>(() => {
  return (
    selectedCrs.value ??
    props.baseLayers.find((layer) => layer.visible)?.crs ??
    props.defaultCrs
  );
});

onMounted(() => {
  proj4.defs("urn:ogc:def:crs:EPSG::2056", EPSG_2056);
  proj4.defs("OGC:CRS84", proj4.defs("EPSG:4326"));
  proj4.defs("EPSG:21781", EPSG_21781);

  const Coordinates = Control.extend({
    onAdd: (leafletMap: Map) => {
      const container = DomUtil.create("div");
      leafletMap.addEventListener("mousemove", (e: LeafletMouseEvent) => {
        const point = crs.value.project(e.latlng);
        const positionText = `Lat/Lon:
          (${e.latlng.lat.toFixed(4)}; ${e.latlng.lng.toFixed(4)})`;
        container.innerHTML = positionText;
        mousemoveSubscription.value?.unsubscribe();
        mousemoveSubscription.value = concat(
          ...demGeorasters.value
            .map((georaster) => identify(georaster, [point.x, point.y]))
            .filter((promise): promise is Promise<number[]> => promise !== null)
            .map((promise) => from(promise))
        )
          .pipe(
            map((values) => values[0]),
            first((altitude) => !!altitude, null) // defined && !== 0
          )
          .subscribe((altitude) => {
            container.innerHTML =
              altitude !== null
                ? [`Altitude: ${altitude.toFixed(0)} m`, positionText].join(
                    "<br>"
                  )
                : positionText;
          });
      });
      leafletMap.addEventListener("mouseout", () => {
        mousemoveSubscription.value?.unsubscribe();
        mousemoveSubscription.value = undefined;
        container.innerHTML = "";
      });
      return container;
    },
  });

  leafletMap = new Map("leaflet-map", {
    center: props.center,
    crs: crs.value,
    zoom: props.zoom,
    zoomControl: false,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
  });

  const layersControl = control.layers(undefined, undefined, {
    position: "topleft",
    autoZIndex: false,
  });
  props.baseLayers.forEach((baseLayer, index) => {
    const baseTileLayer = tileLayer(baseLayer.url, {
      ...baseLayer.options,
      crs: baseLayer.crs,
    } as TileLayerOptions);
    if (index === 0) {
      leafletMap?.addLayer(baseTileLayer);
    }
    layersControl.addBaseLayer(baseTileLayer, baseLayer.name);
  });
  if (props.baseLayers.length > 1) {
    layersControl.addTo(leafletMap);
  }

  new Coordinates({ position: "bottomleft" }).addTo(leafletMap);
  control.scale({ imperial: false, position: "bottomright" }).addTo(leafletMap);
  control.zoom({ position: "topright" }).addTo(leafletMap);

  leafletMap?.on("baselayerchange", (e: LayerEvent) => {
    selectedCrs.value =
      (e.layer as Layer & { options?: TileLayerOptions & { crs?: CRS } })
        .options?.crs ?? undefined;
  });
  if (props.printable) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (control as any).browserPrint().addTo(leafletMap);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Control as any).BrowserPrint.Utils.registerLayer(
      GeoRasterLayer,
      "GeoRasterLayer",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (layer: any) {
        return new GeoRasterLayer(layer.options);
      }
    );
  }

  // new DebugLayer().addTo(this.map).bringToFront();
});

watch(
  () => props.dems,
  (dems) => {
    demGeorasters.value = [];
    dems.forEach((dem) => {
      parseGeoRaster(dem).then((georaster: GeoRaster) => {
        demGeorasters.value.push(georaster);
      });
    });
  },
  {
    immediate: true,
  }
);
// Update only changed this.items to this.layers
watch(
  () => props.items,
  (items) => {
    const newIds: Set<string> = new Set(items.map((item) => item.id));
    const oldIds: Set<string> = new Set(layers.value.map((layer) => layer.id));
    clone(layers.value).forEach((layer) => {
      if (!newIds.has(layer.id)) {
        deleteLayer(layer.id);
      }
    });
    const existingLayers: Promise<MapLayer>[] = items
      .filter((item) => oldIds.has(item.id))
      .map(async (item) => {
        const layer = getLayer(item.id)[0];
        layer.layerGroup.setZIndex(item.zIndex);
        layer.zIndex = item.zIndex;
        return layer;
      });
    const newLayers: Promise<MapLayer>[] = items
      .filter((item) => !oldIds.has(item.id))
      .map(async (item) => {
        const layerGroup: LayerGroup = new LayerGroup();
        layerGroup.setZIndex(item.zIndex);
        const mapLayer = new MapLayer(
          item.id,
          item.id,
          layerGroup,
          item.zIndex
        );
        leafletMap?.addLayer(layerGroup);
        layers.value.push(mapLayer);
        return Promise.all(
          item.children.map((itemLayer) =>
            itemLayer.getLayer().then((layer) => layerGroup.addLayer(layer))
          )
        ).then(() => mapLayer);
      });
    loading.value = true;
    Promise.all([...existingLayers, ...newLayers])
      .then((layers) => {
        // https://github.com/Leaflet/Leaflet/issues/3427
        layers = sortBy(layers, (layer) => layer.zIndex);
        layers.forEach((mapLayer) => {
          mapLayer.layers.forEach((layer) => {
            if (layer.bringToFront) {
              layer.bringToFront();
            }
          });
        });
      })
      .finally(() => (loading.value = false));
  },
  {
    immediate: true,
  }
);

/**
 * @deprecated use zIndex
 */
function moveLayerToFront(id: string): void {
  const [layer, index] = getLayer(id);
  layer.layers.forEach((layer) => layer.bringToFront());
  layers.value.unshift(...layers.value.splice(index, 1));
}

function deleteLayer(id: string): void {
  const [layer, index] = getLayer(id);
  leafletMap?.removeLayer(layer.layerGroup);
  layers.value.splice(index, 1);
}

function getLayer(id: string): [MapLayer, number] {
  const index = layers.value.findIndex((layer) => layer.id === id);
  if (index < 0) {
    throw new Error(`Layer ${id} not found`);
  }
  const layer = layers.value[index] as MapLayer;
  return [layer, index];
}

function getLayers(): MapLayer[] {
  return layers.value as MapLayer[];
}
</script>

<template>
  <div class="full-height" style="min-height: 200px">
    <v-progress-linear :active="loading" indeterminate />
    <div id="leaflet-map" />
  </div>
</template>

<style lang="scss" scoped>
#leaflet-map {
  height: 100%;
}
.leaflet-container {
  background-color: unset;
  z-index: 0;
}
.leaflet-grab {
  cursor: crosshair;
}
</style>

<style lang="scss">
.leaflet-bar {
  border-radius: 0 !important;
  border-color: var(--v-primary-base) !important;

  a {
    border-color: var(--v-primary-base);

    &:hover {
      border-color: var(--v-primary-base);
    }
  }
}

.leaflet-touch .leaflet-bar {
  border-width: 1px;

  a {
    border-radius: 0 !important;
  }

  a.leaflet-browser-print {
    border: none;
  }
}

.leaflet-popup-content-wrapper {
  border-radius: 0;
  border: 1px solid var(--v-primary-base);
  box-shadow: none;
  padding: 0px;

  .leaflet-popup-content {
    margin: 12px;
    text-align: justify;
    hyphens: auto;
  }
}

.leaflet-popup-tip-container {
  display: none;
}

.leaflet-popup-close-button {
  display: none;
}
</style>
