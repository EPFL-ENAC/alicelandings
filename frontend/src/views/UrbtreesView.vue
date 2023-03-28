<script setup lang="ts">
import WebMap, {
  BaseLayer,
  MapGroupItem,
  WmsMapItem,
} from "@/components/WebMap.vue";
import { useAppStore } from "@/stores/app";
import { swisstopoCrs, tileLayerProps } from "@/utils/leaflet";
import { onMounted } from "vue";

const appStore = useAppStore();

const baseLayers: BaseLayer[] = [
  {
    name: "OpenStreetMap",
    visible: true,
    ...tileLayerProps.openStreetMap,
  },
  {
    name: "Swisstopo",
    visible: false,
    ...tileLayerProps.swisstopo_pixelkarte_farbe_2056,
    crs: swisstopoCrs,
  },
];
const center = [46.2107, 6.0946];
const mapItems: MapGroupItem[] = [
  {
    id: "wms",
    zIndex: 1,
    children: [
      new WmsMapItem(
        "https://ge.ch/sitgags1/services/VECTOR/SITG_OPENDATA_04/MapServer/WMSServer?",
        {
          layers: "47", // SIPV_ICA_ARBRE_ISOLE
          format: "image/png",
          transparent: true,
        }
      ),
    ],
  },
];

onMounted(() => {
  appStore.openAppBar();
});
</script>

<template>
  <web-map :center="center" :base-layers="baseLayers" :items="mapItems" />
</template>
