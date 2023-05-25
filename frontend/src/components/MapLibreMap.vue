<script setup lang="ts">
import { DivControl } from "@/utils/control";
import {
  FullscreenControl,
  GeolocateControl,
  Map,
  MapMouseEvent,
  NavigationControl,
  Popup,
  ScaleControl,
  type LngLatLike,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  defineExpose,
  defineProps,
  onMounted,
  ref,
  watch,
  withDefaults,
} from "vue";

defineExpose({
  update,
});
const props = withDefaults(
  defineProps<{
    styleSpec: string | StyleSpecification;
    center?: LngLatLike;
    zoom?: number;
    aspectRatio?: number;
    minZoom?: number;
    maxZoom?: number;
    selectableLayerIds?: string[];
    selectedLayerIds?: string[];
    popupLayerIds?: string[];
    areaLayerIds?: string[];
  }>(),
  {
    center: undefined,
    zoom: 12,
    aspectRatio: undefined,
    minZoom: undefined,
    maxZoom: undefined,
    selectableLayerIds: () => [],
    selectedLayerIds: () => [],
    popupLayerIds: () => [],
    areaLayerIds: () => [],
  }
);

const loading = ref(true);
let map: Map | undefined = undefined;

onMounted(() => {
  map = new Map({
    container: "maplibre-map",
    style: props.styleSpec,
    center: props.center,
    zoom: props.zoom,
    trackResize: true,
  });

  // Create the source
  /*

    "diurne": {
      "type": "raster",
      "tileSize": 256,
      "info": "https://ge.ch/sitg/sitg_catalog/sitg_donnees?keyword=TEMP%C3%89RATURE%20DE%20L%27AIR&topic=tous&service=tous&datatype=tous&distribution=tous&sort=auto",
      "tiles": [
        "https://ge.ch/sitgags1/services/VECTOR/SITG_OPENDATA_04/MapServer/WmsServer?request=GetMap&version=1.3.0&format=image/png&layers=46&transparent=true&width=256&height=256&bbox={bbox-epsg-3857}&styles=default&crs=EPSG:3857"
      ]
    }
    // Température réelle (°C) (période 2020-2049) (ID: 8) situation diurne
  */

  map.addControl(new NavigationControl({}));
  map.addControl(new GeolocateControl({}));
  map.addControl(new ScaleControl({}));
  map.addControl(new FullscreenControl({}));
  const positionControl = new DivControl({ id: "map-position" });
  map.addControl(positionControl, "bottom-left");

  map.on("mousemove", function (event: MapMouseEvent) {
    if (positionControl.container) {
      positionControl.container.innerHTML = `Lat/Lon: (${event.lngLat.lat.toFixed(
        4
      )}; ${event.lngLat.lng.toFixed(4)})`;
    }
  });
  map.on("mouseout", function () {
    if (positionControl.container) {
      positionControl.container.innerHTML = "";
    }
  });

  map.once("load", () => {
    filterLayers();
    loading.value = false;
  });
});

watch(
  () => props.styleSpec,
  (styleSpec) => {
    map?.setStyle(styleSpec);
  },
  { immediate: true }
);
watch(
  () => props.popupLayerIds,
  (popupLayerIds) => {
    popupLayerIds.forEach((layerId) => {
      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
      });
      map?.on("mouseenter", layerId, function (e) {
        if (map) {
          map.getCanvas().style.cursor = "pointer";
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              Object.entries(e.features?.at(0)?.properties ?? {})
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join("<br>")
            )
            .addTo(map);
        }
      });
      map?.on("mouseleave", layerId, function () {
        if (map) {
          map.getCanvas().style.cursor = "";
        }
        popup.remove();
      });
    });
  },
  { immediate: true }
);
watch(
  [() => props.selectableLayerIds, () => props.selectedLayerIds],
  () => filterLayers(),
  {
    immediate: true,
  }
);

function update(center?: LngLatLike, zoom?: number) {
  if (map) {
    if (center !== undefined) {
      map.setCenter(center);
    }
    if (zoom !== undefined) {
      map.setZoom(zoom);
    }
  }
}

function filterLayers() {
  if (map?.loaded()) {
    // ge.ch/sitgags1/rest/services/THEMATIC/CLIMAT_PARAMETRES/MapServer/export?dpi=96&transparent=true&format=png32&layers=show%3A1%2C5%2C7&bbox=669049.4168089365%2C5810077.037729114%2C695496.628595572%2C5814835.24273986&bboxSR=102100&imageSR=102100&size=1384%2C249&f=image

    new TiledMapService("diurne", map, {
      url: "https://ge.ch/sitgags1/rest/services/THEMATIC/CLIMAT_PARAMETRES/MapServer",
    });
    map.addLayer({
      source: "diurne",
      id: "imagery-layer",
      type: "raster",

      minzoom: 14,
      paint: {},
      layout: {
        visibility: "visible",
      },
    });
    map
      .getStyle()
      .layers.filter((layer) => props.selectableLayerIds.includes(layer.id))
      .forEach((layer) => {
        map?.setLayoutProperty(
          layer.id,
          "visibility",
          props.selectedLayerIds.includes(layer.id) ? "visible" : "none"
        );
      });
  }
}
</script>

<template>
  <v-responsive :aspect-ratio="aspectRatio" height="100%">
    <div id="maplibre-map" />
  </v-responsive>
</template>

<style scoped>
#maplibre-map {
  height: 100%;
}
</style>
