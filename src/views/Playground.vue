<template>
  <v-container>
    <h1>Playground</h1>
    <control-web-map></control-web-map>
  </v-container>
</template>

<script lang="ts">
import ControlWebMap from "@/components/ControlWebMap.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    ControlWebMap,
  },
})
export default class Playground extends Vue {}
</script>
