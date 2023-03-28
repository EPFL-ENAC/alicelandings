<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  videoId: string;
  h: string;
}>();
</script>

<template>
  <div style="padding: 49.2% 0 0 0; position: relative">
    <iframe
      :src="`https://player.vimeo.com/video/${props.videoId}?h=${props.h}&title=0&byline=0&portrait=0`"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>
