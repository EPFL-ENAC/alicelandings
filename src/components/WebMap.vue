<template>
  <v-responsive aspect-ratio="1">
    <l-map :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    </l-map>
  </v-responsive>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { LMap, LTileLayer } from "vue2-leaflet";

@Component({
  components: {
    LMap,
    LTileLayer,
  },
})
export default class WebMap extends Vue {
  readonly url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  readonly attribution =
    '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors';
  readonly zoom = 15;
  readonly center = [46.51725, 6.56885];
}
</script>
