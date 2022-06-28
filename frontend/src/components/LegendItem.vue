<template>
  <div class="d-flex align-center">
    <v-img
      class="flex-grow-0 my-1 mr-1"
      :src="imageSrc"
      contain
      :width="size"
      :height="size"
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
  @Prop({ type: Number, default: 42 })
  readonly size!: number;
}
</script>
