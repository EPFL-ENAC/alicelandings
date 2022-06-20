import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/plhebicite",
  },
  {
    path: "/plhebicite",
    name: "Plhebicite",
    component: () =>
      import(/* webpackChunkName: "plhebicite" */ "../views/Plhebicite.vue"),
  },
  {
    path: "/playground",
    name: "Playground",
    component: () =>
      import(/* webpackChunkName: "playground" */ "../views/Playground.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
