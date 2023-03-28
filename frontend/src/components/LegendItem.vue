<script setup lang="ts">
import { defineProps, withDefaults } from "vue";

const props = withDefaults(
  defineProps<{
    imageSrc: string;
    text?: string;
    size?: number;
  }>(),
  {
    text: "",
    size: 42,
  }
);
</script>

<template>
  <div class="d-flex align-center">
    <v-img
      class="flex-grow-0 my-1 mr-1"
      :src="props.imageSrc"
      contain
      :width="props.size"
      :height="props.size"
    />
    <span class="ma-1">
      <slot>
        {{ props.text }}
      </slot>
    </span>
  </div>
</template>
