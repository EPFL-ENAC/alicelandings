<script setup lang="ts">
import { defineProps, onMounted, ref, withDefaults } from "vue";

const props = withDefaults(
  defineProps<{
    name?: string;
    width?: string;
    open?: boolean;
    buttonText?: string;
  }>(),
  {
    name: undefined,
    width: "1024",
    open: false,
    buttonText: undefined,
  }
);

const dialog = ref<boolean>(false);

onMounted(() => {
  if (props.open) {
    dialog.value = true;
  }
});
</script>

<template>
  <v-dialog v-model="dialog" :width="width">
    <template #activator="{ on, attrs }">
      <slot name="activator" :on="on" :attrs="attrs" />
    </template>
    <v-card class="text-justify">
      <v-card-title v-if="name">{{ name }}</v-card-title>
      <v-card-text>
        <br v-if="!name" />
        <slot />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn v-if="buttonText" text @click="dialog = false">
          {{ buttonText }}
        </v-btn>
        <v-btn v-else icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
