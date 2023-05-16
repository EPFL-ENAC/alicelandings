import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigurationStore = defineStore("configuration", () => {
  const parametersUrl = ref<string>(process.env.VUE_APP_PARAMETERS_URL ?? "");
  const styleUrl = ref<string>(process.env.VUE_APP_STYLE_URL ?? "");
  return { parametersUrl, styleUrl };
});
