<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>An Atlas of Vernier Mobility Landscapes</h1>
        <p class="text-subtitle-1">
          An affordance-based and affective reading of the Commune of Vernier,
          Geneva
        </p>
        <v-divider></v-divider>
      </v-col>
    </v-row>
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
            >
              <template v-slot:append="{ item, leaf, selected }">
                <template v-if="!item.disabled && leaf && selected">
                  <v-btn icon @click="moveItemToFront(item)">
                    <v-icon>mdi-flip-to-front</v-icon>
                  </v-btn>
                </template>
              </template>
            </v-treeview>
          </v-list-group>
        </v-list>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col class="flex-grow-1 flex-shrink-0">
        <web-map ref="webMap" :dems="dems" :items="mapItems"></web-map>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import WebMap, { MapItem } from "@/components/WebMap.vue";
import { randomColor, TreeviewItem } from "@/utils/vuetify";
import { Component, Ref, Vue } from "vue-property-decorator";

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
        "The Affective Mappings series offers an alternative way of representing urban lived space in the commune of Vernier. Based on fifteen walk-along interviews done with neighbours of Vernier, these maps attempt to draw these citizens’ affective engagements with their everyday environments highlighting perceptions, landscapes and experience instead of abstract administrative lines or symbols. By acknowledging the lived space of a city in maps that can be collectively shared, discussed and transformed, we can expand our urban imaginaries and improve how we plan and design our cities.",
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
              url: "INT_05_PARCOURS.geojson",
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
        "The Atlas of Mobility Landscapes is a collection of citizen testimonies, documents and images gathered around the experience of walking and cycling in Vernier. Mobility is much more than connecting point A to point B, it is mostly defined by the experience of the journey. Because of that, mobility is an extraordinary point of entrance into the relations between everyday practices and our surrounding environment. The collection is organized according to X large themes and X sub-themes describing the lived experience of the commune of Vernier. The user can navigate the map freely to understand the relationship between different environmental features of the commune and collective imaginaries and perceptions. We believe that making available all these documents in an online and open visualization tool will help acknowledge the importance of these often hidden qualities of space, and how they can encourage more inclusive discussions about the city and its potential futures.",
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

  @Ref()
  readonly webMap!: WebMap;

  selectedTreeviewItems: TreeviewItem<Layer>[][] = [];

  get mapItems(): MapItem[] {
    return this.selectedTreeviewItems
      .flat()
      .map((item) => item.value)
      .flatMap((layer) => layer.children ?? [layer])
      .filter((layer) => layer.url)
      .map((layer) => {
        const id = `${this.rootUrl}data/${layer.url}`;
        return {
          id: id,
          asset: id,
          color: randomColor(),
        };
      });
  }

  getTreeviewItems(
    layers: Layer[],
    parents: Layer[] = []
  ): TreeviewItem<Layer>[] {
    return layers.map((layer) => {
      const parentLayers = [...parents, layer];
      const children = layer.children
        ? this.getTreeviewItems(layer.children, parentLayers)
        : undefined;
      return {
        id: parentLayers.map((parent) => parent.name).join("/"),
        name: layer.name,
        value: layer,
        children: children,
        disabled:
          !layer.url && (children?.every((child) => child.disabled) ?? true),
      };
    });
  }

  moveItemToFront(item: TreeviewItem<Layer>): void {
    const id = `${this.rootUrl}data/${item.value.url}`;
    this.webMap.moveLayerToFront(id);
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
