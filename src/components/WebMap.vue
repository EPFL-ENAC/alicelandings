<template>
  <v-responsive aspect-ratio="1">
    <l-map ref="lMap" :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    </l-map>
  </v-responsive>
</template>

<script lang="ts">
import L, { LeafletMouseEvent, Map } from "leaflet";
import "leaflet.bigimage/dist/Leaflet.BigImage.min.js";
import "vue-class-component/hooks";
import { Component, Ref, Vue } from "vue-property-decorator";
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

  @Ref()
  readonly lMap!: LMap;

  mounted(): void {
    const Coordinates = L.Control.extend({
      onAdd: (map: Map) => {
        const container = L.DomUtil.create("div");
        map.addEventListener("mousemove", (e: LeafletMouseEvent) => {
          container.innerHTML = `
          Latitude/Longitude: 
          (${e.latlng.lat.toFixed(4)}; ${e.latlng.lng.toFixed(4)})`;
        });
        map.addEventListener("mouseout", () => {
          container.innerHTML = "";
        });
        return container;
      },
    });
    this.lMap.mapObject.addControl(new Coordinates({ position: "bottomleft" }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.control as any).BigImage().addTo(this.lMap.mapObject);
  }
}
</script>
