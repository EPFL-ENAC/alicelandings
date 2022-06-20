<template>
  <v-container>
    <h1>A Propos</h1>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapMutations } from "vuex";

@Component({
  methods: {
    ...mapMutations(["openAppBar"]),
  },
})
export default class About extends Vue {
  openAppBar!: () => void;

  created(): void {
    this.openAppBar();
  }
}
</script>
