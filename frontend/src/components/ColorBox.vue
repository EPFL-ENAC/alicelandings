<script setup lang="ts">
import { computed, defineProps, withDefaults } from "vue";

const props = withDefaults(
  defineProps<{
    color: string;
    size?: string;
  }>(),
  {
    size: "16px",
  }
);

const style = computed(() => ({
  backgroundColor: props.color,
  display: "inline-block",
  height: props.size,
  width: props.size,
}));
</script>

<template>
  <div :style="style">&nbsp;</div>
</template>
