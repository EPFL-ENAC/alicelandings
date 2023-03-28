import App from "@/App.vue";
import "@/plugins/gtag";
import vuetify from "@/plugins/vuetify";
import "@/registerServiceWorker";
import router from "@/router";
import "@/styles/alice-font.scss";
import "@/styles/main.scss";
import "@fontsource/roboto";
import "@mdi/font/css/materialdesignicons.min.css";
import "leaflet/dist/leaflet.css";
import { createPinia, PiniaVuePlugin } from "pinia";
import Vue from "vue";

Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

new Vue({
  pinia,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
