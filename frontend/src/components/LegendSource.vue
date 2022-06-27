<template>
  <p class="text-caption">Sources : {{ text }}</p>
</template>

<script lang="ts">
import "vue-class-component/hooks";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LegendSource extends Vue {
  @Prop({ type: String })
  readonly text!: string;
}
</script>
