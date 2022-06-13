<template>
  <div :style="style">&nbsp;</div>
</template>

<script lang="ts">
import "vue-class-component/hooks";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ColorBox extends Vue {
  @Prop(String)
  readonly color!: string;
  @Prop({ type: String, default: "16px" })
  readonly size!: string;

  get style(): Record<string, string | number> {
    return {
      backgroundColor: this.color,
      display: "inline-block",
      height: this.size,
      width: this.size,
    };
  }
}
</script>
