<template>
  <v-container>
    <h1>Playground</h1>
    <control-web-map></control-web-map>
  </v-container>
</template>

<script lang="ts">
import ControlWebMap from "@/components/ControlWebMap.vue";
import { Component, Vue } from "vue-property-decorator";
import { mapMutations } from "vuex";

@Component({
  components: {
    ControlWebMap,
  },
  methods: {
    ...mapMutations(["openAppBar"]),
  },
})
export default class Playground extends Vue {
  openAppBar!: () => void;

  created(): void {
    this.openAppBar();
  }
}
</script>
