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
                <p>
                  <span
                    v-for="item in lasiglegendItems"
                    :key="item.color"
                    style="display: block"
                  >
                    <color-box :color="item.color"></color-box>
                    {{ item.text }}
                  </span>
                </p>
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
import ColorBox from "@/components/ColorBox.vue";
import WebMap, {
  HeatmapMapItem,
  MapGroupItem,
  MapItem,
  RasterTileMapItem,
  TileMapItem,
  UrlMapItem,
} from "@/components/WebMap.vue";
import {
  EPSG_2056,
  RasterTileLayerProp,
  TileLayerProp,
  tileLayerProps,
} from "@/utils/leaflet";
import { getBooleanFromString } from "@/utils/utils";
import { TreeviewItem } from "@/utils/vuetify";
import { Feature } from "geojson";
import { Bounds, IconOptions, point, Proj } from "leaflet";
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
import { mapMutations } from "vuex";

@Component({
  components: {
    ColorBox,
    WebMap,
  },
  methods: {
    ...mapMutations(["toggleAppBar"]),
  },
})
export default class Plhebicite extends Vue {
  toggleAppBar!: () => void;
  readonly center = [46.2107, 6.0946];
  readonly minZoom = 21;
  readonly maxZoom = 25;
  readonly dems: string[] = [
    "04_DELTA_dem_tampon_1500.tif",
    "07_MD_dem_tampon_1500.tif",
  ].map((filename) => this.getDataUrl(filename));
  readonly defaultCrs = new Proj.CRS("EPSG:2056", EPSG_2056, {
    origin: [2488232.00057888823, 1124606.73130729701],
    resolutions: [
      108.266889997823995, 54.1334449989119975, 27.0667224994559987,
      13.5333612497279994, 6.76668062486399968, 3.38334031243199984,
      1.69167015621599992,
    ],
    bounds: new Bounds(
      [2488232.00057888823, 1124606.73130729701],
      [2505232.01689624181, 1111606.66907431604]
    ),
  });
  readonly getIconOptions = function (feature: Feature): IconOptions {
    const properties = feature.properties as Record<string, string>;
    const farAway = properties["far_away"];
    const popupAnchor = point(186, 0);
    switch (farAway) {
      case "false":
        return {
          iconUrl: "img/legends/voices.png",
          iconSize: [64, 64],
          popupAnchor: popupAnchor,
        };
      case "in":
        return {
          iconUrl: "img/legends/voices-in.svg",
          iconSize: [16, 16],
          popupAnchor: popupAnchor,
        };
      case "out":
        return {
          iconUrl: "img/legends/voices.png",
          iconSize: [32, 32],
          popupAnchor: popupAnchor,
        };
    }
    let size = 64;
    if (getBooleanFromString(properties["_LOC_Far a"])) {
      size = 32;
    } else if (getBooleanFromString(properties["_LOC_Gener"])) {
      size = 16;
    }
    return {
      iconUrl: "img/legends/voices.png",
      iconSize: [size, size],
      popupAnchor: point(186, 0),
    };
  };
  readonly categories: Category[] = [
    {
      id: "mapping",
      name: "Cartographies affectives",
      description:
        "Ces cartographies affectives représentent l'espace urbain vécu dans Vernier à travers quinze entretiens réalisés avec des habitant.e.s de la commune. La compréhension et la spatialité de la commune évolue selon qui l'habite. Une image collective partagée émerge à l'intersection des expériences individuelles.",
      active: true,
      layers: [
        {
          name: "Constellation bilinear",
          items: [
            {
              rasterTile: {
                urlTemplate: "test/constellation/bilinear/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation cubic",
          items: [
            {
              rasterTile: {
                urlTemplate: "test/constellation/cubic/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation cubicspline",
          items: [
            {
              rasterTile: {
                urlTemplate: "test/constellation/cubicspline/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation lanczos",
          items: [
            {
              rasterTile: {
                urlTemplate: "test/constellation/lanczos/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation med",
          items: [
            {
              rasterTile: {
                urlTemplate: "test/constellation/med/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation mode",
          items: [
            {
              rasterTile: {
                urlTemplate: "test/constellation/mode/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation test A",
          items: [
            {
              rasterTile: {
                urlTemplate:
                  "int_01_TEST/test-A_int_01_BAIE_CONSTELLATIONS/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
          ],
        },
        {
          name: "Constellation test B",
          items: [
            {
              rasterTile: {
                urlTemplate:
                  "int_01_TEST/test-B_int_01_BAIE_CONSTELLATIONS/{z}/{x}/{y}.png",
                crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
                  origin: [2492448.39314908441, 1121288.76195859746],
                  resolutions: [
                    53.9708821009920001, 26.9854410504960001, 13.492720525248,
                    6.74636026262400001, 3.37318013131200001, 1.686590065656,
                    0.843295032828000002,
                  ],
                  bounds: new Bounds(
                    [2492448.39314908441, 1121288.76195859746],
                    [2500922.87575773103, 1114808.25045507238]
                  ),
                }),
              },
            },
          ],
        },
        {
          name: "Constellation test C",
          items: [
            {
              rasterTile: {
                urlTemplate:
                  "int_01_TEST/test-C_int_01_BAIE_CONSTELLATIONS/{z}/{x}/{y}.png",
                crs: this.defaultCrs,
              },
            },
            {
              url: "int_01_TEST/test-C_int_01_BAIE_CONSTELLATIONS.geojson",
              style: true,
            },
          ],
        },
        {
          name: "Constellation vector",
          items: [
            {
              url: "int_01_TEST/01_vector_export/int_01_foret.geojson",
              style: true,
            },
            {
              url: "int_01_TEST/01_vector_export/int_01_lines.geojson",
              style: true,
            },
            {
              url: "int_01_TEST/01_vector_export/int_01_parcours.geojson",
              style: true,
            },
            {
              url: "int_01_TEST/01_vector_export/int_01_reperes.geojson",
              style: true,
            },
          ],
        },
        {
          name: "01 La forêt tropicale",
          children: [
            {
              name: "Voix",
              items: [
                {
                  url: "interview/voix/int_01_constellation_callout.geojson",
                  styleUrl:
                    "interview/voix/symbol/symbol_constellation_voices_callout.sld",
                },
                {
                  url: "interview/voix/int_01_constellation_voices.geojson",
                  popupKey: "Text Conte",
                  getIconOptions: this.getIconOptions,
                },
              ],
            },
            {
              name: "Parcours",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/parcours/int_01_parcours/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_01_BAIE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
            {
              name: "Horizons",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/horizons/int_01_horizons/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "02 Ville-dortoir",
          children: [
            {
              name: "Voix",
              items: [
                {
                  url: "interview/voix/int_02_PIPELINE_VOICES.geojson",
                  popupKey: "Text Conte",
                  getIconOptions: this.getIconOptions,
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_02_PIPELINE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "03 Une barrière bleue",
          children: [
            {
              name: "Voix",
              items: [
                {
                  url: "interview/voix/int_03_BARRIERE_VOICES.geojson",
                  popupKey: "Text Conte",
                  getIconOptions: this.getIconOptions,
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_03_BARRIERE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "04 Passages secrets",
          children: [
            {
              name: "Voix",
              items: [
                {
                  url: "interview/voix/int_04_SECRETS_VOICES.geojson",
                  popupKey: "Text Conte",
                  getIconOptions: this.getIconOptions,
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_04_SECRETS_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
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
                  name: "callout",
                  items: [
                    {
                      tile: {
                        urlTemplate:
                          "int_voix_test_symboles/int_05_voices_callout/{z}/{x}/{y}.png",
                      },
                    },
                  ],
                },
                {
                  name: "int_05_voices",
                  items: [
                    {
                      url: "int_voix_test_symboles/int_05_voices.geojson",
                      popupKey: "Text Conte",
                      getIconOptions: this.getIconOptions,
                    },
                  ],
                },
              ],
            },
            {
              name: "Parcours",
              items: [
                {
                  tile: {
                    urlTemplate:
                      "INTERVIEW/05_DELTA/trajectoire/plh_interview_05_trajectoire/{z}/{x}/{y}.png",
                  },
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_05_DELTA_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
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
              name: "Voix",
              items: [
                {
                  url: "interview/voix/int_06_DOMTOM_VOICES.geojson",
                  popupKey: "Text Conte",
                  getIconOptions: this.getIconOptions,
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_06_DOM_TOM_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "07 Jeux de pistes",
          children: [
            {
              name: "Voix",
              items: [
                {
                  url: "INTERVIEW/07_CROISIERE/voices/07_CROISIERE_VOICES_IN.geojson",
                  style: true,
                  popupKey: "Text Conte",
                },
                {
                  url: "INTERVIEW/07_CROISIERE/voices/07_CROISIERE_VOICES_OUT.geojson",
                  style: true,
                  popupKey: "Text Content",
                },
              ],
            },
            {
              name: "Parcours",
              items: [
                {
                  url: "INTERVIEW/07_CROISIERE/trajectories/07_CROISIERE_TRAJECTORIES.geojson",
                  style: true,
                },
              ],
            },
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_07_CROISIERE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
            {
              name: "Horizons",
              items: [
                {
                  tile: {
                    urlTemplate:
                      "INTERVIEW/07_CROISIERE/220324_test_07_horizons/{z}/{x}/{y}.png",
                  },
                },
              ],
            },
          ],
        },
        {
          name: "08 Au plateau des pins",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_08_GLANEUSE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "09 Sous les pavés, la Cité",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_09_EPINGLES_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "10 Le nom des rues",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_10_GIACOMETTI_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "11 Une histoire de cailloux",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_11_GREUBE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "12 L'invention d'une ritournelle",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_12_RITOURNELLE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "13 La campagne Naville",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_13_VUACHE_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "14 Le coin de terre",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_14_ETANG_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
            },
          ],
        },
        {
          name: "15 Là où l'on revient",
          children: [
            {
              name: "Constellation",
              items: [
                {
                  rasterTile: {
                    urlTemplate:
                      "interview/constellation/int_15_GREBATTES_CONSTELLATIONS/{z}/{x}/{y}.png",
                    crs: this.defaultCrs,
                  },
                },
              ],
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
              items: [
                {
                  url: "atlas/voix/atlas_voices_mobility_experiences.geojson",
                  style: true,
                  popupKey: "Text Content",
                },
              ],
            },
            {
              name: "Cadre",
              items: [
                {
                  tile: {
                    urlTemplate:
                      "ATLAS/mobility/cadre/plh_atlas_mobility_cadre/{z}/{x}/{y}.png",
                  },
                },
              ],
            },
            {
              name: "Overlay",
              items: [
                {
                  tile: {
                    urlTemplate:
                      "ATLAS/mobility/overlay/plh_atlas_mobility_overlay/{z}/{x}/{y}.png",
                  },
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
      id: "environment",
      name: "Environmental Features",
      description:
        "Les supports de carte facilitent la lecture du territoire. Cependant ils tendent à figer ce même territoire en des images conventionnelles et bien souvent routières. C’est pourquoi chaque chapitre propose différentes couches de cartes à tester par vous-même. Vous trouverez dans cette section des cartes plus générales pour vous situer facilement.",
      active: false,
      layers: [
        {
          name: "heatmap",
          items: [
            {
              heatmap: {
                url: "geojson_obstacles_20220518_tot_sel.geojson",
                latitude: "latitude",
                longitude: "longitude",
              },
            },
          ],
        },
        {
          name: "Fond de carte ALICE ",
          items: [
            {
              tile: {
                urlTemplate: "general/basemap/{z}/{x}/{y}.png",
                options: {
                  tms: true,
                },
              },
            },
          ],
        },
        {
          name: "Carte d’accessibilité LASIG",
          items: [
            {
              rasterTile: {
                urlTemplate:
                  "20220610_hexa_range_code_grid_tot_vn_2056_v17_shp_df_weighted_20210917_ALL_IMAGE/{z}/{x}/{y}.png",
                crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
                  origin: [2493905.19190381095, 1120306.0438000001],
                  resolutions: [
                    22.6755088089738841, 11.3377544044869421,
                    5.66887720224347103, 2.83443860112173551,
                    1.41721930056086776,
                  ],
                  bounds: new Bounds(
                    [2493905.19190381095, 1120306.0438000001],
                    [2498875.37999087805, 1116791.33993460913]
                  ),
                }),
              },
            },
          ],
        },
        {
          name: "grid",
          items: [
            {
              tile: {
                urlTemplate:
                  "general/grid_swisstopo/grid_swisstopo/{z}/{x}/{y}.png",
              },
            },
          ],
        },
        {
          name: "Swisstopo",
          items: [{ tile: tileLayerProps.swisstopo_pixelkarte_farbe_2056 }],
        },
        {
          name: "Image satellite",
          items: [{ tile: tileLayerProps.swisstopo_photo_2056 }],
        },
        {
          name: "repère",
          items: [
            {
              tile: {
                urlTemplate:
                  "general/background_repere/background_repere/{z}/{x}/{y}.png",
              },
            },
          ],
          selected: true,
        },
        {
          name: "repère geojson",
          items: [
            {
              url: "general/repere/GEOJSON/background_repere.geojson",
              style: true,
            },
          ],
          selected: true,
        },
      ],
    },
  ];
  readonly lasiglegendItems: { color: string; text: string }[] = [
    {
      color: "#1a9641",
      text: "0.00000 - 0.07692",
    },
    {
      color: "#a6d96a",
      text: "0.07692 - 0.22260",
    },
    {
      color: "#ffffc0",
      text: "0.22260 - 0.37318",
    },
    {
      color: "#fdae61",
      text: "0.37318 - 0.59601",
    },
    {
      color: "#d7191c",
      text: "0.59601 - 1.00000",
    },
  ];

  @Ref()
  readonly webMap!: WebMap;

  zoom = 22;
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
      .flatMap((item) => item.children ?? [item])
      .map(async (item) => {
        const mapItems = (item.value.items ?? []).flatMap((layerItem) =>
          this.getMapItem(layerItem)
        );
        return {
          id: item.id,
          zIndex: zIndex--,
          children: mapItems,
        } as MapGroupItem;
      });
    Promise.all(promises).then((mapItems) => (this.mapItems = mapItems));
  }

  private getMapItem(layerItem: LayerItem): MapItem[] {
    if (layerItem.url) {
      const absoluteUrl = this.getDataUrl(layerItem.url);
      const styleUrl = layerItem.styleUrl
        ? this.getDataUrl(layerItem.styleUrl)
        : layerItem.style
        ? absoluteUrl.replace(/\.[^/.]+$/, ".sld")
        : undefined;
      return [
        new UrlMapItem(absoluteUrl, {
          styleUrl: styleUrl,
          popupKey: layerItem.popupKey,
          getIconOptions: layerItem.getIconOptions,
        }),
      ];
    }
    if (layerItem.tile) {
      if (!layerItem.tile.urlTemplate.startsWith("https://")) {
        layerItem.tile.urlTemplate = this.getDataUrl(
          layerItem.tile.urlTemplate
        );
      }
      return [new TileMapItem(layerItem.tile)];
    }
    if (layerItem.rasterTile) {
      if (!layerItem.rasterTile.urlTemplate.startsWith("https://")) {
        layerItem.rasterTile.urlTemplate = this.getDataUrl(
          layerItem.rasterTile.urlTemplate
        );
      }
      return [new RasterTileMapItem(layerItem.rasterTile)];
    }
    if (layerItem.heatmap) {
      if (!layerItem.heatmap.url.startsWith("https://")) {
        layerItem.heatmap.url = this.getDataUrl(layerItem.heatmap.url);
      }
      return [
        new HeatmapMapItem(
          layerItem.heatmap.url,
          layerItem.heatmap.latitude,
          layerItem.heatmap.longitude
        ),
      ];
    }
    throw new Error("Expected url or tile or rasterTile");
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
      const id = parentLayers.map((parent) => parent.name).join("/");
      const disabled =
        layer.disabled ||
        (!layer.items && (children?.every((child) => child.disabled) ?? true));
      return {
        id: id,
        name: layer.name,
        value: layer,
        children: children,
        disabled: disabled,
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
  items?: LayerItem[];
  selected?: boolean;
  disabled?: boolean;
  children?: Layer[];
}

interface LayerItem {
  url?: string;
  popupKey?: string;
  tile?: TileLayerProp;
  rasterTile?: RasterTileLayerProp;
  style?: boolean;
  styleUrl?: string;
  heatmap?: {
    url: string;
    latitude?: string;
    longitude?: string;
  };
  getIconOptions?: (feature: Feature) => IconOptions;
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
