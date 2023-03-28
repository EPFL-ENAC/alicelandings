import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    appBar: false,
  }),
  actions: {
    toggleAppBar() {
      this.appBar = !this.appBar;
    },
    openAppBar() {
      this.appBar = true;
    },
  },
});
