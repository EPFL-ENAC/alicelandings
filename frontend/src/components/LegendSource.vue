<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  text: string;
}>();
</script>

<template>
  <p class="text-caption">Sources : {{ props.text }}</p>
</template>
