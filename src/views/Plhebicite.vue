<template>
  <div class="d-flex flex-column full-height">
    <div class="d-flex flex-row justify-space-between mx-4">
      <div class="flex-grow-1">
        <h1>An Atlas of Vernier Mobility Landscapes</h1>
        <p class="text-subtitle-1">
          An affordance-based and affective reading of the Commune of Vernier,
          Geneva
        </p>
        <span>Zoom level: {{ zoom }}</span>
      </div>
      <div class="flex-grow-0">
        <a href="https://alice.epfl.ch" target="_blank">
          <v-img
            aspect-ratio="2"
            contain
            src="/logo/alice_logo2-01.png"
            width="100px"
          ></v-img>
        </a>
        <a href="https://epfl.ch" target="_blank">
          <v-img
            aspect-ratio="2"
            contain
            src="/logo/EPFL_Logo_184X53.svg"
            width="100px"
          ></v-img>
        </a>
      </div>
    </div>
    <v-divider></v-divider>
    <div class="flex-grow-1 d-flex flex-row">
      <div class="d-flex flex-column">
        <div
          class="flex-even"
          :style="{ 'max-height': about ? '0px' : undefined }"
        >
          <v-list dense width="350" max-height="100%">
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
        </div>
        <v-divider v-if="!about"></v-divider>
        <v-btn v-if="!about" class="flex-grow-0" text @click="about = true">
          About
        </v-btn>
        <div v-if="about" class="ma-4">
          <v-btn class="float-right" icon color="black" @click="about = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <h2>About</h2>
          <p>
            To address the challenges posed by climate change to our cities, it
            is essential to acknowledge the role the environment plays in our
            everyday lives. However our maps tend to silence our lived
            experience and how it both shapes and is shaped by the places we
            move through. Consequently, planning and design processes have often
            disregarded this and lost great opportunities to collectively shape
            friendlier and human-oriented cities. An analysis of active mobility
            practices in the commune of Vernier offers us the chance to create
            alternative spatial representations to know this lived dimension. By
            having maps able to address affective engagements, social
            imaginaries, and collective memories, we can make our communities
            matter more in the conversations about our cities' future.
          </p>
          <p>
            The <span class="font-weight-bold">Affective Mappings</span> series
            offers an alternative way of representing urban lived space in the
            commune of Vernier. Based on fifteen walk-along interviews done with
            neighbours of Vernier, these maps attempt to draw these citizens'
            affective engagements with their everyday environments highlighting
            perceptions, landscapes and experience instead of abstract
            administrative lines or symbols. By acknowledging the lived space of
            a city in maps that can be collectively shared, discussed and
            transformed, we can expand our urban imaginaries and improve how we
            plan and design our cities.
          </p>
          <p>
            The
            <span class="font-weight-bold">Atlas of Mobility Landscapes</span>
            is a collection of citizen testimonies, documents and images
            gathered around the experience of walking and cycling in Vernier.
            Mobility is much more than connecting point A to point B, it is
            mostly defined by the experience of the journey. Because of that,
            mobility is an extraordinary point of entrance into the relations
            between everyday practices and our surrounding environment. The
            collection is organized according to X large themes and X sub-themes
            describing the lived experience of the commune of Vernier. The user
            can navigate the map freely to understand the relationship between
            different environmental features of the commune and collective
            imaginaries and perceptions.
          </p>
          <p>
            We believe that making available all these documents in an online
            and open visualization tool will help acknowledge the importance of
            these often hidden qualities of space, and how they can encourage
            more inclusive discussions about the city and its potential futures.
          </p>
          <p>
            Cet outil de visualisation a été créé en collaboration avec l'équipe
            IT4R de l'EPFL dans le cadre du projet de recherche
            <span class="font-weight-bold">PLHEBICITE</span>
            (Planifier des villes plus saines et plus riches en biodiversité:
            relier les quartiers grâce à une mobilité active et des
            infrastructures paysagères). Ce projet est une collaboration entre
            les laboratoires ALICE (Atelier de la Conception de l'Espace) et
            LASIG (Laboratoire des Systèmes d'Information Géographique) de
            l'EPFL, afin d'étudier de quelle manière l'espace urbain influence
            et potentialise les pratiques de mobilité active ainsi que le bien
            être et la santé physique et psychologique des habitants de la
            commune de Vernier à Genève.
          </p>
        </div>
      </div>
      <v-divider vertical></v-divider>
      <div class="flex-grow-1 d-flex flex-column">
        <web-map
          ref="webMap"
          :center="center"
          :dems="dems"
          :items="mapItems"
          :min-zoom="minZoom"
          :max-zoom="maxZoom"
          :zoom.sync="zoom"
        ></web-map>
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
import WebMap, {
  MapGroupItem,
  TileMapItem,
  UrlMapItem,
} from "@/components/WebMap.vue";
import { Metadata } from "@/models/qgis";
import { TileLayerProp, tileLayerProps } from "@/utils/leaflet";
import { TreeviewItem } from "@/utils/vuetify";
import axios from "axios";
import { Component, Ref, Vue, Watch } from "vue-property-decorator";

@Component({
  components: {
    WebMap,
  },
})
export default class Plhebicite extends Vue {
  readonly center = [46.2107, 6.0946];
  readonly minZoom = 14;
  readonly maxZoom = 18;
  readonly dems: string[] = [
    "04_DELTA_dem_tampon_1500.tif",
    "07_MD_dem_tampon_1500.tif",
  ].map((filename) => this.getAbsoluteUrl(filename));
  readonly categories: Category[] = [
    {
      name: "Cartographies affectives de Vernier",
      description:
        "Ces cartographies affectives représentent l'espace urbain vécu dans Vernier à travers quinze entretiens réalisés avec des habitant.e.s de la commune. La compréhension et la spatialité de la commune évolue selon qui l'habite. Une image collective partagée émerge à l'intersection des expériences individuelles.",
      layers: [
        {
          name: "01 La forêt tropicale",
        },
        {
          name: "02 Ville-dortoir",
        },
        {
          name: "03 Une barrière bleue",
        },
        {
          name: "04 Passages secrets",
        },
        {
          name: "05 Archipels et deltas",
        },
        {
          name: "05 Delta & Archipels",
          children: [
            {
              name: "Voix",
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
              name: "Parcours",
              tile: {
                urlTemplate: this.getAbsoluteUrl(
                  "INTERVIEW/05_DELTA/220324_test_05_trajectories/{z}/{x}/{y}.png"
                ),
              },
            },
            {
              name: "Constellation",
              tile: {
                urlTemplate: this.getAbsoluteUrl(
                  "INTERVIEW/05_DELTA/220322_test_05_constellation/{z}/{x}/{y}.png"
                ),
              },
            },
            {
              name: "Horizons",
              tile: {
                urlTemplate: this.getAbsoluteUrl(
                  "INTERVIEW/05_DELTA/220324_test_05_horizons/{z}/{x}/{y}.png"
                ),
              },
            },
          ],
        },
        {
          name: "06 Territoires DOM-TOM",
        },
        {
          name: "07 Jeux de pistes",
          children: [
            {
              name: "Voix",
              children: [
                {
                  name: "In",
                  url: "INTERVIEW/07_CROISIERE/voices/07_CROISIERE_VOICES_IN.geojson",
                },
                {
                  name: "Out",
                  url: "INTERVIEW/07_CROISIERE/voices/07_CROISIERE_VOICES_OUT.geojson",
                },
              ],
            },
            {
              name: "Parcours",
              tile: {
                urlTemplate: this.getAbsoluteUrl(
                  "INTERVIEW/07_CROISIERE/220324_test_07_trajectories/{z}/{x}/{y}.png"
                ),
              },
            },
            {
              name: "Constellation",
              tile: {
                urlTemplate: this.getAbsoluteUrl(
                  "INTERVIEW/07_CROISIERE/220322_test_07_constellation/{z}/{x}/{y}.png"
                ),
              },
            },
            {
              name: "Horizons",
              tile: {
                urlTemplate: this.getAbsoluteUrl(
                  "INTERVIEW/07_CROISIERE/220324_test_07_horizons/{z}/{x}/{y}.png"
                ),
              },
            },
          ],
        },
        {
          name: "08 Au plateau des pins",
        },
        {
          name: "09 Sous les pavés, la Cité",
        },
        {
          name: "10 Le nom des rues",
        },
        {
          name: "11 Une histoire de cailloux",
        },
        {
          name: "12 L'invention d'une ritournelle",
        },
        {
          name: "13 La campagne Naville",
        },
        {
          name: "14 Le coin de terre",
        },
        {
          name: "15 Là où l'on revient",
        },
      ],
    },
    {
      name: "Atlas de mobilité",
      description:
        "La collection de cet Atlas est organisée selon 10 grands thèmes et 49 sous-thèmes. L'utilisateur peut naviguer librement sur la carte pour comprendre la relation entre les caractéristiques environnementales et les perceptions collectives.",
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
          name: "Expériences de mobilité",
          children: [
            {
              name: "Voix",
              url: "ATLAS/MOBILITY_EXPERIENCES/voices/05_07_MOBILITY_EXPERIENCES_VOICES.geojson",
              popupKey: "Text Conte",
            },
            {
              name: "Cadre",
            },
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
    {
      name: "Environmental Features",
      description:
        "Les supports de carte facilitent la lecture du territoire. Cependant ils tendent à figer ce même territoire en des images conventionnelles et bien souvent routières. C’est pourquoi chaque chapitre propose différentes couches de cartes à tester par vous-même. Vous trouverez dans cette section des cartes plus générales pour vous situer facilement.",
      layers: [
        {
          name: "Fond de carte ALICE ",
        },
        {
          name: "Carte d’accessibilité LASIG",
          url: "grid_tot_vn_21781_v17_shp_df_weighted_20210917_MANUAL_INDEX_V3.geojson",
        },
        {
          name: "Swisstopo",
          tile: tileLayerProps.swisstopo_pixelkarte_farbe,
          selected: true,
        },
        {
          name: "Image satellite",
          tile: tileLayerProps.swisstopo_photo,
        },
        {
          name: "OpenStreetMap",
          tile: tileLayerProps.openStreetMap,
        },
      ],
    },
  ];

  @Ref()
  readonly webMap!: WebMap;

  zoom = 15;
  selectedTreeviewItems: TreeviewItem<Layer>[][] = [];
  mapItems: MapGroupItem[] = [];
  about = false;

  created(): void {
    this.selectedTreeviewItems = this.categories.map((category) =>
      this.getTreeviewItems(category.layers, (layer) => !!layer.selected)
    );
  }

  @Watch("selectedTreeviewItems")
  onSelectedTreeviewItemsChanged(): void {
    const promises: Promise<MapGroupItem>[] = this.selectedTreeviewItems
      .flat()
      .map((item) => item.value)
      .flatMap((layer) => layer.children ?? [layer])
      .filter((layer) => layer.url || layer.tile)
      .map(async (layer) => {
        if (layer.url) {
          const absoluteUrl = this.getAbsoluteUrl(layer.url);
          if (absoluteUrl.endsWith("metadata.json")) {
            const metadata = await axios
              .get<Metadata>(absoluteUrl)
              .then((response) => response.data);
            const prefix = absoluteUrl.replace("metadata.json", "");
            return {
              id: absoluteUrl,
              children: metadata.layers.map(
                (layer) =>
                  new UrlMapItem(prefix + layer.geojson, {
                    styleUrl: prefix + layer.sld,
                  })
              ),
            };
          } else {
            const style = absoluteUrl?.endsWith(".geojson")
              ? absoluteUrl.replace(/\.[^/.]+$/, ".sld")
              : undefined;
            return {
              id: absoluteUrl,
              children: [
                new UrlMapItem(absoluteUrl, {
                  styleUrl: style,
                  popupKey: layer.popupKey,
                }),
              ],
            };
          }
        }
        if (layer.tile) {
          return {
            id: layer.tile.urlTemplate,
            children: [new TileMapItem(layer.tile)],
          } as MapGroupItem;
        }
        throw new Error("Expected url or tile");
      });
    Promise.all(promises).then((mapItems) => (this.mapItems = mapItems));
  }

  private getAbsoluteUrl(dataUrl?: string): string {
    return `${location.origin}${process.env.BASE_URL}data/${dataUrl}`;
  }

  getTreeviewItems(
    layers: Layer[],
    predicate: (layer: Layer) => boolean = () => true,
    parents: Layer[] = []
  ): TreeviewItem<Layer>[] {
    return layers.filter(predicate).map((layer) => {
      const parentLayers = [...parents, layer];
      const children = layer.children
        ? this.getTreeviewItems(layer.children, predicate, parentLayers)
        : undefined;
      return {
        id: parentLayers.map((parent) => parent.name).join("/"),
        name: layer.name,
        value: layer,
        children: children,
        disabled:
          !layer.url &&
          !layer.tile &&
          (children?.every((child) => child.disabled) ?? true),
      };
    });
  }

  moveItemToFront(item: TreeviewItem<Layer>): void {
    const id = this.getAbsoluteUrl(item.value.url);
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
  tile?: TileLayerProp;
  selected?: boolean;
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
  min-height: 0;
}

.v-list {
  padding: 0;
  overflow-y: auto;
}
</style>
