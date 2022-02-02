<template>
  <v-container fluid>
    <v-row>
      <v-col class="flex-grow-0 flex-shrink-1">
        <v-list dense>
          <v-list-group
            v-for="(item, index) in categories"
            :key="index"
            color
            no-action
            :value="index === 0"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title class="font-weight-black">
                  {{ item.name }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <p class="mx-4 text-caption text-justify">
              {{ item.description }}
            </p>
            <v-treeview
              v-model="selectedTreeviewItems[index]"
              dense
              :items="getTreeviewItems(item.layers)"
              return-object
              selectable
            ></v-treeview>
          </v-list-group>
        </v-list>
      </v-col>
      <v-col class="flex-grow-1 flex-shrink-0">
        <web-map :dems="dems" :items="layerUrls"></web-map>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import WebMap from "@/components/WebMap.vue";
import { TreeviewItem } from "@/utils/vuetify";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    WebMap,
  },
})
export default class Plhebicite extends Vue {
  readonly rootUrl = process.env.BASE_URL;
  readonly dems: string[] = [
    "04_DELTA_dem_tampon_1500.tif",
    "07_MD_dem_tampon_1500.tif",
  ].map((filename) => `${this.rootUrl}data/${filename}`);
  readonly categories: Category[] = [
    {
      name: "Affective Mapping of Vernier",
      description:
        "Definition of the affective mappings, how they were created and what they can mean to our understanding of space.",
      layers: [
        {
          name: "01 La fôret tropicale",
        },
        {
          name: "02 Ville dortoir",
        },
        {
          name: "03 La famille italienne",
        },
        {
          name: "04 Archipels, Delta",
          children: [
            {
              name: "Voices",
            },
            {
              name: "Trajectory",
            },
            {
              name: "Constellation",
            },
            {
              name: "Viewshed",
              url: "04_DELTA_viewshed_analysis_1000.tif",
            },
          ],
        },
        {
          name: "05 Dreyfus est un chien",
        },
        {
          name: "06 Jeux de pistes",
          children: [
            {
              name: "Viewshed",
              url: "07_MD_viewshed_analysis_1000.tif",
            },
          ],
        },
        {
          name: "07 Au plateau des pins",
        },
        {
          name: "08 Sous les pavés, la cité",
        },
        {
          name: "09 Le nom des rues",
        },
        {
          name: "10 Une histoire de cailloux",
        },
        {
          name: "11 L’invention d’une ritournelle",
        },
      ],
    },
    {
      name: "Atlas of Mobility Landscapes",
      description:
        "Definition of the atlas of mobility landscapes, how they have been created and what they can mean to our understanding of space and the role of active mobility in our everyday experience and attachment to a place.",
      layers: [
        {
          name: "Place attachment & spatial reach",
        },
        {
          name: "Identity of the commune",
        },
        {
          name: "Imaginaries & Oral knowledges",
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
          name: "Well-Being & Risk Perception",
        },
        {
          name: "Situated Practices",
        },
        {
          name: "Territoriality",
        },
        {
          name: "Political Ecologies",
        },
      ],
    },
  ];

  selectedTreeviewItems: TreeviewItem<Layer>[][] = [];

  get layerUrls(): string[] {
    return this.selectedTreeviewItems
      .flat()
      .map((item) => item.value)
      .flatMap((layer) => layer.children ?? [layer])
      .filter((layer) => layer.url)
      .map((layer) => `${this.rootUrl}data/${layer.url}`);
  }

  getTreeviewItems(layers: Layer[], prefix = ""): TreeviewItem<Layer>[] {
    return layers.map((layer) => {
      const id = `${prefix}/${layer.name}`;
      const children = layer.children
        ? this.getTreeviewItems(layer.children, id)
        : undefined;
      return {
        id: id,
        name: layer.name,
        value: layer,
        children: children,
        disabled:
          !layer.url && (children?.every((child) => child.disabled) ?? true),
      };
    });
  }
}

interface Category {
  name: string;
  description: string;
  layers: Layer[];
}

interface Layer {
  name: string;
  url?: string;
  children?: Layer[];
}
</script>
