<template>
  <web-map
    :center="center"
    :base-layers="baseLayers"
    :items="mapItems"
  ></web-map>
</template>

<script lang="ts">
import WebMap, {
  BaseLayer,
  MapGroupItem,
  WmsMapItem,
} from "@/components/WebMap.vue";
import { swisstopoCrs, tileLayerProps } from "@/utils/leaflet";
import { Component, Vue } from "vue-property-decorator";
import { mapMutations } from "vuex";

@Component({
  components: {
    WebMap,
  },
  methods: {
    ...mapMutations(["openAppBar"]),
  },
})
export default class Plhebicite extends Vue {
  openAppBar!: () => void;
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

  created(): void {
    this.openAppBar();
  }
}
</script>
