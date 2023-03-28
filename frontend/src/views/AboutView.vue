<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { onMounted } from "vue";

const appStore = useAppStore();

onMounted(() => {
  appStore.openAppBar();
});
</script>

<template>
  <v-container>
    <h1>A Propos</h1>
    <br />
    <a href="https://www.epfl.ch/labs/alice/" target="_blank">ALICE</a>
  </v-container>
</template>
