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
