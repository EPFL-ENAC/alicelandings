<template>
  <v-dialog v-model="dialog" :width="width">
    <template #activator="{ on, attrs }">
      <slot name="activator" :on="on" :attrs="attrs"></slot>
    </template>
    <v-card class="text-justify">
      <v-card-title v-if="name">{{ name }}</v-card-title>
      <v-card-text>
        <br v-if="!name" />
        <slot></slot>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import "vue-class-component/hooks";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class SimpleDialog extends Vue {
  @Prop(String)
  readonly name?: string;
  @Prop({ type: Number, default: 1024 })
  readonly width!: number;

  dialog = false;
}
</script>
