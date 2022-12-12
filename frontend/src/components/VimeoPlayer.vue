<template>
  <div style="padding: 49.2% 0 0 0; position: relative">
    <iframe
      :src="`https://player.vimeo.com/video/${videoId}?h=${h}&title=0&byline=0&portrait=0`"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script lang="ts">
import "vue-class-component/hooks";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class VimeoPlayer extends Vue {
  @Prop(String)
  readonly videoId!: string;
  @Prop(String)
  readonly h!: string;
}
</script>
