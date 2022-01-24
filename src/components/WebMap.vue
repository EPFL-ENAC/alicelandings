<template>
  <v-row>
    <v-col cols="12">
      <v-select
        v-model="baseLayer"
        :items="baseLayerItems"
        label="Base Layer"
      ></v-select>
    </v-col>
    <v-col cols="12">
      <v-responsive aspect-ratio="1.6">
        <l-map ref="lMap" :zoom="zoom" :center="center">
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        </l-map>
      </v-responsive>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { SelectItemObject } from "@/utils/vuetify";
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
  readonly zoom = 15;
  readonly center = [46.51725, 6.56885];

  readonly baseLayerItems: SelectItemObject<string, BaseLayer>[] = [
    {
      text: "OpenStreetMap",
      value: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    {
      text: "swisstopo",
      value: {
        url: "https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
        attribution:
          '&copy; <a target="_blank" href="https://www.swisstopo.admin.ch/en/home.html">swisstopo</a>',
      },
    },
  ];

  @Ref()
  readonly lMap!: LMap;

  baseLayer: BaseLayer = this.baseLayerItems[0].value;

  get map(): Map {
    return this.lMap.mapObject;
  }

  get url(): string {
    return this.baseLayer.url;
  }

  get attribution(): string | undefined {
    return this.baseLayer.attribution;
  }

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
    this.map.addControl(new Coordinates({ position: "bottomleft" }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.control as any).BigImage().addTo(this.map);
  }
}

interface BaseLayer {
  url: string;
  attribution?: string;
}
</script>

<style scoped>
.leaflet-container {
  z-index: 0;
}
</style>
