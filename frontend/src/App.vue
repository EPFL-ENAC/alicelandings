<template>
  <v-app>
    <v-app-bar v-if="appBar" app dense>
      <v-app-bar-title>Alice Landings</v-app-bar-title>
      <v-tabs>
        <v-tab to="/plhebicite">Plhebicite</v-tab>
        <v-tab to="/about">A Propos</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapState } from "vuex";

@Component({
  computed: {
    ...mapState(["appBar"]),
  },
})
export default class App extends Vue {
  readonly appBar!: boolean;
}
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  overflow: unset;
}
</style>
