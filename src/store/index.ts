import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    appBar: false,
  },
  mutations: {
    toggleAppBar(state) {
      state.appBar = !state.appBar;
    },
  },
  actions: {},
  modules: {},
});
