<script setup lang="ts">
import JsonWebMap from "@/components/JsonWebMap.vue";

const parametersUrl = process.env.VUE_APP_PARAMETERS_URL;
const styleUrl = process.env.VUE_APP_STYLE_URL;
console.log(styleUrl);
console.log(parametersUrl);
</script>

<template>
  <JsonWebMap :parameters-url="parametersUrl" :style-url="styleUrl" />
</template>
