<template>
  <v-app>
    <v-app-bar v-if="appBar" app dense @mouseleave="appBar = false">
      <v-app-bar-title>Alice Landings</v-app-bar-title>
      <v-tabs>
        <v-tab to="/">Home</v-tab>
        <v-tab to="/plhebicite">Plhebicite</v-tab>
        <v-tab to="/about">About</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-app-bar v-if="!appBar" app height="8px" @mouseover="appBar = true">
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
  appBar = false;
}
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  overflow: unset;
}
</style>
