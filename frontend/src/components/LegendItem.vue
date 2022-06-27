<template>
  <div class="d-flex align-center">
    <v-img
      class="flex-grow-0 ma-1"
      :src="imageSrc"
      contain
      width="32"
      height="32"
    ></v-img>
    <span class="ma-1">
      <slot>
        {{ text }}
      </slot>
    </span>
  </div>
</template>

<script lang="ts">
import "vue-class-component/hooks";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LegendItem extends Vue {
  @Prop(String)
  readonly imageSrc!: string;
  @Prop({ type: String, default: "" })
  readonly text!: string;
}
</script>

<style lang="scss" scoped>
.v-image {
  border-style: solid;
  border-width: 1px;
}
</style>
