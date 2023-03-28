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
      import(
        /* webpackChunkName: "plhebicite" */ "../views/PlhebiciteView.vue"
      ),
  },
  // {
  //   path: "/urbtrees",
  //   name: "Urbtrees",
  //   component: () =>
  //     import(/* webpackChunkName: "urbtrees" */ "../views/Urbtrees.vue"),
  // },
  {
    path: "/playground",
    name: "Playground",
    component: () =>
      import(
        /* webpackChunkName: "playground" */ "../views/PlaygroundView.vue"
      ),
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
