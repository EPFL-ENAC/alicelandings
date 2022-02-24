<template>
  <div class="d-flex flex-column full-height">
    <div>
      <div class="ma-4">
        <h1>An Atlas of Vernier Mobility Landscapes</h1>
        <p class="text-subtitle-1">
          An affordance-based and affective reading of the Commune of Vernier,
          Geneva
        </p>
      </div>
      <v-divider></v-divider>
    </div>
    <div class="flex-grow-1 d-flex flex-row">
      <v-list dense max-width="350">
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
      <v-divider vertical></v-divider>
      <div class="flex-grow-1 d-flex flex-column">
        <web-map ref="webMap" :dems="dems" :items="mapItems"></web-map>
        <v-divider></v-divider>
        <div class="d-flex flex-row">
          <div class="flex-even ma-2">
            <h4>Left Legend</h4>
            <p>
              On the left legend we have information about the active layers on
              the left column plus the color and symbol legend of what we are
              seeing. There are two legends, one for AffMaps, another for Atlas.
            </p>
          </div>
          <v-divider vertical></v-divider>
          <div class="flex-even ma-2">
            <h4>Right Legend</h4>
            <p>
              On the Right Legend we have the information about the elements the
              user clicks on the map. Consider in the building of the table to
              create a column of attributes for all elements (for instance for
              the constellation elements, an explanation)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
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
          name: "05 Delta & Archipels",
          children: [
            {
              name: "Voices",
              children: [
                {
                  name: "In",
                  url: "INTERVIEW/05_DELTA/voices/05_DELTA_VOICES_IN.geojson",
                  popupKey: "Text Conte",
                },
                {
                  name: "Out",
                  url: "INTERVIEW/05_DELTA/voices/05_DELTA_VOICES_OUT.geojson",
                  popupKey: "Text Content",
                },
              ],
            },
            {
              name: "Trajectories",
              url: "INTERVIEW/05_DELTA/trajectories/05_DELTA_TRAJECTORIES.geojson",
            },
            {
              name: "Constellation",
            },
            {
              name: "Horizons",
              url: "INTERVIEW/05_DELTA/horizons/05_DELTA_HORIZONS.tif",
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
          children: [
            {
              name: "Codes",
              url: "ATLAS/MOBILITY_EXPERIENCES/codes/05_07_MOBILITY_EXPERIENCES_CODES.geojson",
            },
            {
              name: "Overlay",
              children: [
                {
                  name: "Network",
                  url: "ATLAS/MOBILITY_EXPERIENCES/overlay/1_network/MOBILITY_EXPERIENCES_OVERLAY_1.geojson",
                },
                {
                  name: "Signs",
                  url: "ATLAS/MOBILITY_EXPERIENCES/overlay/2_signs/MOBILITY_EXPERIENCES_OVERLAY_2.geojson",
                },
              ],
            },
            {
              name: "Voices",
              url: "ATLAS/MOBILITY_EXPERIENCES/voices/05_07_MOBILITY_EXPERIENCES_VOICES.geojson",
              popupKey: "Text Conte",
            },
          ],
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
          popupKey: layer.popupKey,
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
  popupKey?: string;
  children?: Layer[];
}
</script>

<style lang="scss" scoped>
.v-divider {
  border-color: black !important;
  z-index: 1;
}

.flex-even {
  flex: 1 1 0;
}

.v-list {
  padding: 0;
}
</style>
