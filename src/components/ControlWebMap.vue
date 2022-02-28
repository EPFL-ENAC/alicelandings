<template>
  <v-row>
    <v-col cols="8">
      <web-map ref="webMap" :items="mapItems"></web-map>
    </v-col>
    <v-col cols="4">
      <h2>Layers</h2>
      <v-file-input
        v-model="inputFiles"
        accept="application/json, application/x-zip-compressed, image/tiff, .geojson"
        chips
        clearable
        label="Add layer"
        multiple
        show-size
        @change="addLayers"
      ></v-file-input>
      <v-list>
        <v-list-item
          v-for="(item, index) in layers"
          :key="index"
          :color="item.color.base"
          :input-value="layerActives[index]"
        >
          <v-list-item-action>
            <v-checkbox
              v-model="layerActives[index]"
              :color="item.color.base"
            ></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle
              v-if="item.colorScale"
              class="d-flex justify-space-between"
              :style="{
                backgroundImage: `linear-gradient(to right, ${item.colorScale.colorMin}, ${item.colorScale.colorMax})`,
              }"
            >
              <span>{{ item.colorScale.valueMin }}</span>
              <span>{{ item.colorScale.valueMax }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="moveLayerToFront(item.id)">
              <v-icon>mdi-flip-to-front</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn icon @click="deleteLayer(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import WebMap, { MapItem, MapLayer } from "@/components/WebMap.vue";
import { randomColor } from "@/utils/vuetify";
import "vue-class-component/hooks";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    WebMap,
  },
})
export default class ControlWebMap extends Vue {
  $refs!: {
    webMap: WebMap;
  };

  inputFiles: File[] = [];
  layerFiles: File[] = [];
  layerActives: boolean[] = [];
  webMap: WebMap | null = null;

  get mapItems(): MapItem[] {
    return this.layerFiles.map((file) => ({
      id: file.name,
      asset: file,
      color: randomColor(),
    }));
  }

  get layers(): MapLayer[] {
    return this.webMap?.layers ?? [];
  }

  mounted(): void {
    this.webMap = this.$refs.webMap;
  }

  addLayers(): void {
    this.layerFiles.push(...this.inputFiles);
    this.layerActives.push(...this.inputFiles.map(() => true));
    this.inputFiles = [];
  }

  moveLayerToFront(id: string): void {
    this.$refs.webMap.moveLayerToFront(id);
  }

  deleteLayer(id: string): void {
    this.$refs.webMap.deleteLayer(id);
  }
}
</script>
