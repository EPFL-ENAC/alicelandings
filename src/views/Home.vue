<template>
  <v-container fluid>
    <web-map></web-map>
  </v-container>
</template>

<script lang="ts">
import WebMap from "@/components/WebMap.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    WebMap,
  },
})
export default class Home extends Vue {}
</script>
