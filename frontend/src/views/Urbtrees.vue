<template>
  <web-map
    :center="center"
    :base-layers="baseLayers"
    :items="mapItems"
  ></web-map>
</template>

<script lang="ts">
import WebMap, { MapItem, TileLayerProps } from "@/components/WebMap.vue";
import { tileLayerProps } from "@/utils/leaflet";
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
  readonly baseLayers: TileLayerProps[] = [
    {
      name: "OpenStreetMap",
      url: tileLayerProps.openStreetMap.url,
      visible: true,
      options: tileLayerProps.openStreetMap.options,
    },
  ];
  readonly center = [46.2107, 6.0946];
  readonly mapItems: MapItem[] = [];

  created(): void {
    this.openAppBar();
  }
}
</script>
