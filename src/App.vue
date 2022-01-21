<template>
  <v-app>
    <v-app-bar app dense>
      <v-app-bar-title>Plhebicite</v-app-bar-title>
      <v-tabs>
        <v-tab to="/">Home</v-tab>
        <v-tab to="/about">About</v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.v-toolbar__title {
  overflow: unset;
}
</style>
