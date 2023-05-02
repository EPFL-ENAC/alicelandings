<script setup lang="ts">
import vuetify from "@/plugins/vuetify";
import { useAppStore } from "@/stores/app";
import { ref } from "vue";

const appStore = useAppStore();

const mobileWarning = ref(vuetify.framework.breakpoint.xs);
</script>

<template>
  <v-app>
    <v-app-bar v-if="appStore.appBar" app dense>
      <v-app-bar-title>Alice Landings</v-app-bar-title>
      <v-tabs>
        <v-tab to="/plhebicite">Plhebicite</v-tab>
        <v-tab to="/urbtrees">Urbtrees</v-tab>
        <v-tab to="/about">A Propos</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    <v-bottom-sheet v-model="mobileWarning" persistent>
      <v-sheet class="text-center" height="512px">
        <h1>Attention</h1>
        <p>Ce site ne supporte pas les écrans mobiles</p>
        <v-btn icon color="warning" @click="mobileWarning = false">
          <v-icon left>mdi-close</v-icon>
          Fermer
        </v-btn>
      </v-sheet>
    </v-bottom-sheet>
  </v-app>
</template>

<style lang="scss" scoped>
.v-toolbar__title {
  overflow: unset;
}
</style>
