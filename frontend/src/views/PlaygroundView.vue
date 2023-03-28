<script setup lang="ts">
import ControlWebMap from "@/components/ControlWebMap.vue";
import { useAppStore } from "@/stores/app";
import { onMounted } from "vue";

const appStore = useAppStore();

onMounted(() => {
  appStore.openAppBar();
});
</script>

<template>
  <v-container>
    <h1>Playground</h1>
    <control-web-map />
  </v-container>
</template>
