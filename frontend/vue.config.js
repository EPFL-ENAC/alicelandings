const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  chainWebpack: (config) => {
    config.plugin("polyfills").use(NodePolyfillPlugin);
  },

  transpileDependencies: ["vuetify"],

  configureWebpack: {
    devtool: "source-map",
  },

  pages: {
    index: {
      entry: "src/main.ts",
      title: "Alice Landings",
    },
  },

  pwa: {
    workboxPluginMode: "GenerateSW",
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
  },
};
