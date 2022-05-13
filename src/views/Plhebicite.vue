<template>
  <div class="d-flex flex-column full-height text-justify">
    <div class="d-flex flex-row align-center ma-3">
      <div class="flex-grow-1">
        <h1>An Atlas of Vernier Mobility Landscapes</h1>
        <span class="text-subtitle-1">
          An affordance-based and affective reading of the Commune of Vernier,
          Geneva
        </span>
      </div>
      <a href="https://epfl.ch" target="_blank">
        <v-img
          contain
          src="/logo/EPFL_Logo_184X53.svg"
          height="50px"
          width="100px"
        ></v-img>
      </a>
      <v-btn icon color="primary" class="ml-3" @click="toggleAppBar">
        <v-icon x-large>mdi-menu</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="flex-grow-1 d-flex flex-row">
      <div class="d-flex flex-column">
        <div class="flex-even">
          <v-list dense width="300" height="100%">
            <v-list-group
              v-for="(item, index) in categories"
              :key="index"
              v-model="item.active"
              color
              no-action
              @click="clickCategory(item)"
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-black">
                    <h3>{{ item.name }}</h3>
                  </v-list-item-title>
                </v-list-item-content>
              </template>
              <p class="mx-3">
                {{ item.description }}
              </p>
              <v-treeview
                v-model="selectedTreeviewItems[index]"
                dense
                :items="getTreeviewItems(item.layers)"
                off-icon="mdi-square-outline"
                on-icon="mdi-square"
                indeterminate-icon="mdi-square"
                return-object
                selectable
                selected-color="secondary"
              >
              </v-treeview>
            </v-list-group>
          </v-list>
        </div>
        <v-divider></v-divider>
        <v-dialog v-model="aboutDialog" width="1024">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              class="flex-grow-0 about-btn btn-right"
              text
              v-on="on"
            >
              About
            </v-btn>
          </template>
          <v-card class="text-justify">
            <v-card-title>About</v-card-title>
            <v-card-text>
              <p>
                To address the challenges posed by climate change to our cities,
                it is essential to acknowledge the role the environment plays in
                our everyday lives. However our maps tend to silence our lived
                experience and how it both shapes and is shaped by the places we
                move through. Consequently, planning and design processes have
                often disregarded this and lost great opportunities to
                collectively shape friendlier and human-oriented cities. An
                analysis of active mobility practices in the commune of Vernier
                offers us the chance to create alternative spatial
                representations to know this lived dimension. By having maps
                able to address affective engagements, social imaginaries, and
                collective memories, we can make our communities matter more in
                the conversations about our cities' future.
              </p>
              <p>
                The
                <span class="font-weight-bold">Affective Mappings</span> series
                offers an alternative way of representing urban lived space in
                the commune of Vernier. Based on fifteen walk-along interviews
                done with neighbours of Vernier, these maps attempt to draw
                these citizens' affective engagements with their everyday
                environments highlighting perceptions, landscapes and experience
                instead of abstract administrative lines or symbols. By
                acknowledging the lived space of a city in maps that can be
                collectively shared, discussed and transformed, we can expand
                our urban imaginaries and improve how we plan and design our
                cities.
              </p>
              <p>
                The
                <span class="font-weight-bold"
                  >Atlas of Mobility Landscapes</span
                >
                is a collection of citizen testimonies, documents and images
                gathered around the experience of walking and cycling in
                Vernier. Mobility is much more than connecting point A to point
                B, it is mostly defined by the experience of the journey.
                Because of that, mobility is an extraordinary point of entrance
                into the relations between everyday practices and our
                surrounding environment. The collection is organized according
                to X large themes and X sub-themes describing the lived
                experience of the commune of Vernier. The user can navigate the
                map freely to understand the relationship between different
                environmental features of the commune and collective imaginaries
                and perceptions.
              </p>
              <p>
                We believe that making available all these documents in an
                online and open visualization tool will help acknowledge the
                importance of these often hidden qualities of space, and how
                they can encourage more inclusive discussions about the city and
                its potential futures.
              </p>
              <p>
                Cet outil de visualisation a été créé en collaboration avec
                l'équipe IT4R de l'EPFL dans le cadre du projet de recherche
                <span class="font-weight-bold">PLHEBICITE</span>
                (Planifier des villes plus saines et plus riches en
                biodiversité: relier les quartiers grâce à une mobilité active
                et des infrastructures paysagères). Ce projet est une
                collaboration entre les laboratoires ALICE (Atelier de la
                Conception de l'Espace) et LASIG (Laboratoire des Systèmes
                d'Information Géographique) de l'EPFL, afin d'étudier de quelle
                manière l'espace urbain influence et potentialise les pratiques
                de mobilité active ainsi que le bien être et la santé physique
                et psychologique des habitants de la commune de Vernier à
                Genève.
              </p>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn icon @click="aboutDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
          <div class="flex-even legend">
            <div class="ma-3">
              <template v-if="selectedCategoryId === 'mapping'">
                <h4>Description</h4>
                <p>
                  La compréhension et la spatialité de la commune évoluent selon
                  qui l’habite et comment. Ces cartes tentent de dessiner les
                  engagements affectifs des citoyens avec leur environnement
                  quotidien, en mettant en évidence leurs perceptions, leurs
                  paysages et leurs expériences.
                </p>
              </template>
              <template v-if="selectedCategoryId === 'atlas'">
                <h4>Description de la thématique</h4>
                <p>
                  Les pratiques de mobilité peuvent être soit encouragées, soit
                  bloquées par l'environnement matériel et physiologique dans
                  lequel nous vivons. Expérience de mobilité se compose de
                  quatre codes qui étudient les manières et raisons de se
                  déplacer, les paramètres influençant la qualité et fréquence
                  des déplacements ainsi que les itinéraires choisis ou évités
                  dans la mobilité douce.
                </p>
              </template>
              <template v-if="selectedCategoryId === 'environment'">
                <h4>Description</h4>
                <p>
                  La carte d'accessibilité est une mesure environnementale sur
                  une grille de 100x100m d’après un index de 17 paramètres
                  facilitant ou obstruant la mobilité piétonne. Elle a été
                  effectuée par le laboratoire LASIG.
                </p>
              </template>
            </div>
          </div>
          <v-divider vertical></v-divider>
          <div class="flex-even legend">
            <div class="ma-3">
              <template v-if="selectedCategoryId === 'mapping'">
                <h4>Légende</h4>
                <p class="d-flex">
                  <v-img
                    src="img/legends/voices.png"
                    contain
                    width="32"
                  ></v-img>
                  <span>
                    <span class="font-weight-bold">Voix. </span>Recueille des
                    fragments de récits tout au long du parcours effectué,
                    parlant de lieux directement visibles, proches ou lointains
                    qui apparaissent dans la discussion.
                  </span>
                </p>
                <p class="d-flex">
                  <v-img
                    src="img/legends/parcours.png"
                    contain
                    width="32"
                  ></v-img>
                  <span>
                    <span class="font-weight-bold">Parcours. </span>L’itinéraire
                    de l’entretien effectué. La largeur fluctue selon la vitesse
                    de marche, la couleur selon la pente du parcours.
                  </span>
                </p>
                <p class="d-flex">
                  <v-img
                    src="img/legends/constellation.png"
                    contain
                    width="32"
                  ></v-img>
                  <span>
                    <span class="font-weight-bold">Constellation. </span
                    >Rassemblent une série de lieux significatifs pour chaque
                    récit, montrant l'étendue et la nature discontinue de notre
                    expérience vécue et les différents territoires que cela
                    dessine.
                  </span>
                </p>
                <p class="d-flex">
                  <v-img
                    src="img/legends/horizons.png"
                    contain
                    width="32"
                  ></v-img>
                  <span>
                    <span class="font-weight-bold">Horizons. </span>Succession
                    de points de vue visibles depuis l’itinéraire. Révèle la
                    profondeur de l’espace affecté par notre mobilité et
                    l’étendue variable du regard selon les lieux.
                  </span>
                </p>
              </template>
              <template v-if="selectedCategoryId === 'atlas'">
                <h4>Description du cadre</h4>
                <p>
                  Réseau piéton de la commune de Vernier et dessin de la
                  signalétique au sol (bus, piéton, vélo, TIM) révélant les
                  relations et conflits entre les différents moyens de transport
                  ainsi que leurs chorégraphies communes.
                </p>
                <p>Sources : Openstreemap / SITG</p>
              </template>
              <template v-if="selectedCategoryId === 'environment'">
                <h4>Légende</h4>
                <p>Gradient de couleurs.</p>
                <p>
                  Un carré vert montre que la zone favorise le déplacement à
                  pied. A l’inverse un carré rouge montre qu’il est difficile de
                  circuler à pied.
                </p>
                <p>
                  Quelques paramètres de l’index : largeur des trottoirs,
                  continuité des trottoirs, bruit routier, degré de connectivité
                  au réseau, densité de chemins parcourables à pied, distance à
                  un espace vert...
                </p>
              </template>
            </div>
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
import { mapMutations } from "vuex";

@Component({
  components: {
    WebMap,
  },
  methods: {
    ...mapMutations(["toggleAppBar"]),
  },
})
export default class Plhebicite extends Vue {
  toggleAppBar!: () => void;
  readonly center = [46.2107, 6.0946];
  readonly minZoom = 12;
  readonly maxZoom = 18;
  readonly dems: string[] = [
    "04_DELTA_dem_tampon_1500.tif",
    "07_MD_dem_tampon_1500.tif",
  ].map((filename) => this.getDataUrl(filename));
  readonly categories: Category[] = [
    {
      id: "mapping",
      name: "Cartographies affectives",
      description:
        "Ces cartographies affectives représentent l'espace urbain vécu dans Vernier à travers quinze entretiens réalisés avec des habitant.e.s de la commune. La compréhension et la spatialité de la commune évolue selon qui l'habite. Une image collective partagée émerge à l'intersection des expériences individuelles.",
      active: true,
      layers: [
        {
          name: "01 La forêt tropicale",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_01_BAIE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Constellation 1000 150dpi",
              tile: {
                urlTemplate:
                  "int_constellation_test_resolution/int_01_test_resolution_1000_150dpi/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Constellation 2000 150dpi",
              tile: {
                urlTemplate:
                  "int_constellation_test_resolution/int_01_test_resolution_2000_150dpi/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Constellation 3330 150dpi",
              tile: {
                urlTemplate:
                  "int_constellation_test_resolution/int_01_test_resolution_3330_150dpi/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "02 Ville-dortoir",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_02_PIPELINE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "03 Une barrière bleue",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_03_BARRIERE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "04 Passages secrets",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_04_SECRETS_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "05 Delta & Archipels",
          children: [
            {
              name: "Voix",
              children: [
                {
                  name: "in",
                  url: "INTERVIEW/05_DELTA/voices/voices_in/plh_interview_05_voices_in.geojson",
                  popupKey: "Text Conte",
                },
                {
                  name: "in general",
                  url: "INTERVIEW/05_DELTA/voices/voices_in_general/plh_interview_05_voices_in_general.geojson",
                  popupKey: "Text Conte",
                },
                {
                  name: "out",
                  url: "INTERVIEW/05_DELTA/voices/voices_out/plh_interview_05_voices_out.geojson",
                  popupKey: "Text Conte",
                },
                {
                  name: "out general",
                  url: "INTERVIEW/05_DELTA/voices/voices_out_callout/plh_interview_05_voices_out_callout.geojson",
                },
              ],
            },
            {
              name: "Voix test",
              children: [
                {
                  name: "callout",
                  tile: {
                    urlTemplate:
                      "int_voix_test_symboles/int_05_voices_callout/{z}/{x}/{y}.png",
                  },
                },
                {
                  name: "callout geojson",
                  url: "int_voix_test_symboles/int_05_voices_callout.geojson",
                },
                {
                  name: "int_05_voices",
                  url: "int_voix_test_symboles/int_05_voices.geojson",
                  popupKey: "Text Conte",
                },
              ],
            },
            {
              name: "Parcours",
              tile: {
                urlTemplate:
                  "INTERVIEW/05_DELTA/trajectoire/plh_interview_05_trajectoire/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_05_DELTA_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Horizons",
              children: [
                {
                  name: "black",
                  tile: {
                    urlTemplate:
                      "INTERVIEW/05_DELTA/horizons/plh_interview_05_horizons_black/{z}/{x}/{y}.png",
                  },
                },
                {
                  name: "white",
                  tile: {
                    urlTemplate:
                      "INTERVIEW/05_DELTA/horizons/plh_interview_05_horizons_white/{z}/{x}/{y}.png",
                  },
                },
              ],
            },
          ],
        },
        {
          name: "06 Territoires DOM-TOM",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_06_DOM_TOM_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "07 Jeux de pistes",
          children: [
            {
              name: "Voix",
              children: [
                {
                  name: "in",
                  url: "INTERVIEW/07_CROISIERE/voices/07_CROISIERE_VOICES_IN.geojson",
                  style: true,
                  popupKey: "Text Conte",
                },
                {
                  name: "out",
                  url: "INTERVIEW/07_CROISIERE/voices/07_CROISIERE_VOICES_OUT.geojson",
                  style: true,
                  popupKey: "Text Content",
                },
              ],
            },
            {
              name: "Parcours",
              url: "INTERVIEW/07_CROISIERE/trajectories/07_CROISIERE_TRAJECTORIES.geojson",
              style: true,
            },
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_07_CROISIERE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Horizons",
              tile: {
                urlTemplate:
                  "INTERVIEW/07_CROISIERE/220324_test_07_horizons/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "08 Au plateau des pins",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_08_GLANEUSE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "09 Sous les pavés, la Cité",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_09_EPINGLES_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "10 Le nom des rues",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_10_GIACOMETTI_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "11 Une histoire de cailloux",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_11_GREUBE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "12 L'invention d'une ritournelle",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_12_RITOURNELLE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "13 La campagne Naville",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_13_VUACHE_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "14 Le coin de terre",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_14_ETANG_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "15 Là où l'on revient",
          children: [
            {
              name: "Constellation",
              tile: {
                urlTemplate:
                  "INTERVIEW/int_15_GREBATTES_CONSTELLATIONS/{z}/{x}/{y}.png",
              },
            },
          ],
        },
      ],
    },
    {
      id: "atlas",
      name: "Atlas de mobilité",
      description:
        "La collection de cet Atlas est organisée selon 10 grands thèmes et 49 sous-thèmes. L'utilisateur peut naviguer librement sur la carte pour comprendre la relation entre les caractéristiques environnementales et les perceptions collectives.",
      active: false,
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
              url: "ATLAS/mobility/voices/plh_atlas_mobility_voices.geojson",
              style: true,
              popupKey: "Text Conte",
            },
            {
              name: "Cadre",
              tile: {
                urlTemplate:
                  "ATLAS/mobility/cadre/plh_atlas_mobility_cadre/{z}/{x}/{y}.png",
              },
            },
            {
              name: "Codes",
              url: "ATLAS/MOBILITY_EXPERIENCES/codes/05_07_MOBILITY_EXPERIENCES_CODES.geojson",
            },
            {
              name: "Overlay",
              tile: {
                urlTemplate:
                  "ATLAS/mobility/overlay/plh_atlas_mobility_overlay/{z}/{x}/{y}.png",
              },
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
      id: "environment",
      name: "Environmental Features",
      description:
        "Les supports de carte facilitent la lecture du territoire. Cependant ils tendent à figer ce même territoire en des images conventionnelles et bien souvent routières. C’est pourquoi chaque chapitre propose différentes couches de cartes à tester par vous-même. Vous trouverez dans cette section des cartes plus générales pour vous situer facilement.",
      active: false,
      layers: [
        {
          name: "Fond de carte ALICE ",
        },
        {
          name: "Carte d’accessibilité LASIG",
          url: "grid_tot_vn_21781_v17_shp_df_weighted_20210917_MANUAL_INDEX_V3.geojson",
          style: true,
        },
        {
          name: "grid",
          tile: {
            urlTemplate:
              "general/grid_swisstopo/grid_swisstopo/{z}/{x}/{y}.png",
          },
        },
        {
          name: "Swisstopo",
          tile: tileLayerProps.swisstopo_pixelkarte_farbe,
        },
        {
          name: "Image satellite",
          tile: tileLayerProps.swisstopo_photo,
        },
        {
          name: "OpenStreetMap",
          tile: tileLayerProps.openStreetMap,
        },
        {
          name: "repère",
          tile: {
            urlTemplate:
              "general/background_repere/background_repere/{z}/{x}/{y}.png",
          },
          selected: true,
        },
        {
          name: "repère geojson",
          url: "general/repere/GEOJSON/background_repere.geojson",
          style: true,
          selected: true,
        },
      ],
    },
  ];

  @Ref()
  readonly webMap!: WebMap;

  zoom = 15;
  selectedTreeviewItems: TreeviewItem<Layer>[][] = [];
  mapItems: MapGroupItem[] = [];
  selectedCategoryId: CategoryId = "mapping";
  aboutDialog = false;

  created(): void {
    this.selectedTreeviewItems = this.categories.map((category) =>
      this.getTreeviewItems(category.layers, (layer) => !!layer.selected)
    );
  }

  @Watch("selectedTreeviewItems")
  onSelectedTreeviewItemsChanged(): void {
    let zIndex = 0;
    const promises: Promise<MapGroupItem>[] = this.selectedTreeviewItems
      .flat()
      .map((item) => item.value)
      .flatMap((layer) => layer.children ?? [layer])
      .filter((layer) => layer.url || layer.tile)
      .map(async (layer) => {
        if (layer.url) {
          const absoluteUrl = this.getDataUrl(layer.url);
          if (absoluteUrl.endsWith("metadata.json")) {
            const metadata = await axios
              .get<Metadata>(absoluteUrl)
              .then((response) => response.data);
            const prefix = absoluteUrl.replace("metadata.json", "");
            return {
              id: absoluteUrl,
              zIndex: zIndex--,
              children: metadata.layers.map(
                (layer) =>
                  new UrlMapItem(prefix + layer.geojson, {
                    styleUrl: prefix + layer.sld,
                  })
              ),
            };
          } else {
            const style = layer.style
              ? absoluteUrl.replace(/\.[^/.]+$/, ".sld")
              : undefined;
            return {
              id: absoluteUrl,
              zIndex: zIndex--,
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
          if (!layer.tile.urlTemplate.startsWith("https://")) {
            layer.tile.urlTemplate = this.getDataUrl(layer.tile.urlTemplate);
          }
          return {
            id: layer.tile.urlTemplate,
            zIndex: zIndex--,
            children: [new TileMapItem(layer.tile)],
          } as MapGroupItem;
        }
        throw new Error("Expected url or tile");
      });
    Promise.all(promises).then((mapItems) => (this.mapItems = mapItems));
  }

  private getDataUrl(path: string): string {
    return `${process.env.VUE_APP_DATA_URL}/${path}`;
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
          layer.disabled ||
          (!layer.url &&
            !layer.tile &&
            (children?.every((child) => child.disabled) ?? true)),
      };
    });
  }

  clickCategory(category: Category): void {
    if (!category.active) {
      this.selectedCategoryId = category.id;
    }
  }
}

type CategoryId = "mapping" | "atlas" | "environment";

interface Category {
  id: CategoryId;
  name: string;
  description: string;
  active: boolean;
  layers: Layer[];
}

interface Layer {
  name: string;
  url?: string;
  popupKey?: string;
  tile?: TileLayerProp;
  selected?: boolean;
  style?: boolean;
  disabled?: boolean;
  children?: Layer[];
}
</script>

<style lang="scss" scoped>
.v-divider {
  border-color: var(--v-primary-base) !important;
  z-index: 1;
}

.flex-even {
  flex: 1 1 0;
  min-height: 0;
}

.v-list {
  padding: 0;
  overflow: auto;
}

.legend {
  height: 140px;
  overflow: auto;

  .v-image {
    margin-right: 8px;
  }
}
</style>
