import "@fontsource/roboto";
import "@mdi/font/css/materialdesignicons.min.css";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import Vue from "vue";
import App from "./App.vue";
import "./plugins/gtag";
import vuetify from "./plugins/vuetify";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import "./styles/alice-font.scss";
import "./styles/main.scss";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

// https://vue2-leaflet.netlify.app/quickstart/#marker-icons-are-missing
type D = Icon.Default & {
  _getIconUrl?: string;
};

delete (Icon.Default.prototype as D)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
