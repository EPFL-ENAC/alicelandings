<script setup lang="ts">
import WebMap from "@/components/WebMap.vue";
import { tileLayerProps } from "@/utils/leaflet";
import { randomColor } from "@/utils/vuetify";
import { BaseLayer, FileMapItem, MapGroupItem, MapLayer } from "@/utils/webMap";
import { computed, ref } from "vue";

const center: [number, number] = [46.2107, 6.0946];
const baseLayers: BaseLayer[] = [
  {
    name: "OpenStreetMap",
    visible: true,
    ...tileLayerProps.openStreetMap,
  },
];

const webMap = ref<InstanceType<typeof WebMap>>();
const inputFiles = ref<File[]>([]);
const layerFiles = ref<File[]>([]);
const layerActives = ref<boolean[]>([]);

const mapItems = computed<MapGroupItem[]>(() => {
  let zIndex = 0;
  return layerFiles.value.map((file) => ({
    id: file.name,
    zIndex: zIndex--,
    children: [new FileMapItem(file, { color: randomColor() })],
  }));
});
const layers = computed<MapLayer[]>(() => webMap.value?.getLayers() ?? []);

function addLayers(): void {
  layerFiles.value.push(...inputFiles.value);
  layerActives.value.push(...inputFiles.value.map(() => true));
  inputFiles.value = [];
}

function moveLayerToFront(id: string): void {
  webMap.value?.moveLayerToFront(id);
}

function deleteLayer(id: string): void {
  layerFiles.value = layerFiles.value.filter((file) => file.name != id);
  webMap.value?.deleteLayer(id);
}
</script>

<template>
  <v-row>
    <v-col cols="8">
      <v-responsive aspect-ratio="1">
        <web-map
          ref="webMap"
          :base-layers="baseLayers"
          :center="center"
          :items="mapItems"
          printable
        />
      </v-responsive>
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
      />
      <v-list>
        <v-list-item
          v-for="(item, index) in layers"
          :key="index"
          :input-value="layerActives[index]"
        >
          <v-list-item-action>
            <v-checkbox v-model="layerActives[index]" />
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
