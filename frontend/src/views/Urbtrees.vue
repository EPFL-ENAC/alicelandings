<template>
  <web-map
    :center="center"
    :base-layers="baseLayers"
    :items="mapItems"
  ></web-map>
</template>

<script lang="ts">
import WebMap from "@/components/WebMap.vue";
import { useAppStore } from "@/stores/app";
import { swisstopoCrs, tileLayerProps } from "@/utils/leaflet";
import { BaseLayer, MapGroupItem, WmsMapItem } from "@/utils/webMap";
import { Component, Vue } from "vue-property-decorator";

const appStore = useAppStore();

@Component({
  components: {
    WebMap,
  },
})
export default class Plhebicite extends Vue {
  readonly baseLayers: BaseLayer[] = [
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
  readonly center = [46.2107, 6.0946];
  readonly mapItems: MapGroupItem[] = [
    {
      id: "wms",
      zIndex: 1,
      children: [
        new WmsMapItem(
          "https://ge.ch/sitgags1/rest/services/VECTOR/SITG_GEOSERVICEDATA/MapServer/4913",
          {
            layers: "4913", // SIPV_ICA_ARBRE_ISOLE
            format: "image/png",
            transparent: true,
          }
        ),
      ],
    },
  ];

  created(): void {
    appStore.openAppBar();
  }
}
</script>
