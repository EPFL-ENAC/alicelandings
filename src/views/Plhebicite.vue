<template>
  <v-row>
    <v-col class="flex-grow-0 flex-shrink-1">
      <v-navigation-drawer permanent app>
        <v-list dense>
          <v-subheader>Thematic Atlas</v-subheader>
          <v-list-item
            v-for="(item, index) in atlasLayers"
            :key="'atlas-' + index"
            link
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-subheader>Constellation</v-subheader>
          <v-list-item
            v-for="(item, index) in stories"
            :key="'constellation-' + index"
            link
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-col>
    <v-col class="flex-grow-1 flex-shrink-0">
      <web-map></web-map>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import WebMap from "@/components/WebMap.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    WebMap,
  },
})
export default class Plhebicite extends Vue {
  readonly atlasLayers: AtlasLayer[] = [
    {
      name: "Place Attachment & Spatial Reach",
    },
    {
      name: "Identity of the Commune",
    },
    {
      name: "Imaginary - Orality",
    },
    {
      name: "Mobility Experiences",
    },
    {
      name: "Non Visual Dimensions",
    },
    {
      name: "Memory & Plural Temporalities",
    },
    {
      name: "Risk Perception & Health",
    },
    {
      name: "Situated Practices",
    },
    {
      name: "Territoriality",
    },
  ];
  readonly stories: Story[] = [
    {
      name: "La forêt tropicale",
    },
    {
      name: "Pipelines",
    },
    {
      name: "La cité-dortoir",
    },
    {
      name: "La barrière bleue",
    },
    {
      name: "Passages secrets",
    },
    {
      name: "Delta & Archipels",
    },
    {
      name: "DOM-TOM",
    },
    {
      name: "Jeux de piste",
    },
    {
      name: "Au plateau des pins",
    },
    {
      name: "Sous les pavés, la Cité",
    },
    {
      name: "Le nom des rues",
    },
    {
      name: "Une histoire de cailloux",
    },
    {
      name: "Le Grand Tour",
    },
    {
      name: "La campagne Naville",
    },
    {
      name: "Les ...",
    },
    {
      name: "Là où l'on revient",
    },
  ];
}

interface AtlasLayer {
  name: string;
}
interface Story {
  name: string;
}
</script>
