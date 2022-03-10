module.exports = {
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
};
