<template>
  <v-app>
    <v-app-bar v-if="appBar" app dense>
      <v-app-bar-title>Alice Landings</v-app-bar-title>
      <v-tabs>
        <v-tab to="/plhebicite">Plhebicite</v-tab>
        <v-tab to="/urbtrees">Urbtrees</v-tab>
        <v-tab to="/about">A Propos</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
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
  mobileWarning = this.$vuetify.breakpoint.mobile;
}
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  overflow: unset;
}
</style>
