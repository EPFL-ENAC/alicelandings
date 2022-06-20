<template>
  <div class="d-flex flex-column full-height text-justify">
    <div class="d-flex flex-row align-center ma-3">
      <div class="flex-grow-1">
        <h1>Un atlas des paysages de mobilité à Vernier</h1>
        <span class="text-subtitle-1">
          Vers une lecture affective de l’espace de la Commune de Vernier,
          Genève
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
          <v-list dense width="330" height="100%">
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
              <!-- eslint-disable-next-line vue/no-v-html -->
              <p class="mx-3" v-html="item.description"></p>
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
        <div class="d-flex">
          <simple-dialog class="flex-even" name="Infos">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" class="flex-even btn-left" text v-on="on">
                Infos
              </v-btn>
            </template>
            <template v-slot>
              <h4>Le projet Plhebicite</h4>
              <p>
                Ce projet, fruit d'une collaboration entre ALICE (Atelier de la
                Conception de l'Espace) et LASIG (Laboratoire des Systèmes
                d'Information Géographique), aborde le changement climatique
                sous l'angle de l'infrastructure paysagère en tant que solution
                basée sur la nature capable de relier la connectivité urbaine,
                la mobilité active et la santé et le bien-être psychophysiques.
                Le paysage urbain joue un rôle infrastructurel clé, en soutenant
                et en rendant possibles différentes pratiques et comportements,
                et peut donc être instrumentalisé pour aborder l'interrelation
                complexe entre espace, mobilité et santé dans la ville
                contemporaine. Ce rôle est étudié en combinant l'approche de
                LASIG sur les systèmes d'information géographique et la
                modélisation territoriale avec l'approche sensible d'ALICE sur
                l'espace urbain, l'infrastructure paysagère et les pratiques de
                mobilité, et appliqué à la commune de Vernier (GE).
                <a
                  href="https://www.epfl.ch/schools/enac/les-defis-du-developpement-durable/clusters-fr/enac-interdisciplinary-cluster-grants-fr/enac-cluster-grants-selected-projects-2020/planning-for-healthier-and-biodiverse-cities-%e2%80%a8linking-neighbourhoods-through-active-mobility-and-landscape-infrastructure/"
                  target="_blank"
                >
                  Link
                </a>
              </p>
              <h4>Partenaires</h4>
              <p>
                Commune de Vernier<br />
                Canton de Genève <br />
                Hélène Mariéthoz<br />
                <a
                  href="https://www.epfl.ch/schools/enac/about/data-at-enac/enac-it4research/"
                  target="_blank"
                >
                  ENAC-IT4R
                </a>
              </p>
              <h4>Remerciements</h4>
              <p>
                Nous remercions les nombreuses personnes qui nous ont aidé dans
                la recherche et qui ont participé au projet. En particuliers les
                habitant.e.s nous ayant guidé à travers la commune durant les
                entretiens en marchant. Nous remercions également le service de
                la cohésion sociale, les contrats de quartiers, les personnes
                rencontrées dans des associations ou dans les différents
                quartiers, le service de la culture et communication, le service
                de l’aménagement.
              </p>
              <h4>Equipe</h4>
              <p>
                Lucía Jalón Oyarzun (ALICE)<br />
                Marco Vieira Ruas (LASIG)<br />
                Emmanuelle Agustoni (ALICE)<br />
                Aurèle Pulfer (ALICE)<br />
                Charlotte Weil (ENAC-IT4R)<br />
                David Tang (ENAC-IT4R)
              </p>
              <h4>Contact</h4>
              <p>
                N’hésitez-pas à nous contacter pour toute question ou remarque
                concernant le projet et pour nous faire part de vos idées !
                <br />
                Nous serons heureux.ses de vous répondre par email ou téléphone.
              </p>
              <p>
                <a href="mailto:lucia.jalonoyarzun@epfl.ch">Lucía</a>,
                <a href="mailto:marco.vieiraruas@epfl.ch">Marco</a> and
                <a href="mailto:emmanuelle.agustoni@epfl.ch">Emmanuelle</a>
                <br />
                ALICE Administration /
                <a href="mailto:jaime.ruiz@epfl.ch">Jaime Ruiz</a> /
                <a href="tel:+41216933203">+41 21 693 32 03</a>
              </p>
            </template>
          </simple-dialog>
          <simple-dialog class="flex-even" name="A Propos">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" class="flex-even btn-right" text v-on="on">
                A Propos
              </v-btn>
            </template>
            <template v-slot>
              <h4>Le projet</h4>
              <p>
                Pour relever les défis posés par le changement climatique dans
                nos villes, il est essentiel de reconnaître le rôle que joue
                l'environnement dans notre vie quotidienne. Cependant, nos
                cartes ont tendance à passer sous silence notre expérience vécue
                et la manière dont elle façonne et est façonnée par les lieux
                que nous traversons. Par conséquent, les processus de
                planification et de conception n'en ont souvent pas tenu compte
                et ont perdu de grandes opportunités de façonner collectivement
                des villes plus conviviales et plus humaines. Une analyse des
                pratiques de mobilité active dans la commune de Vernier nous
                offre la possibilité de créer des images spatiales alternatives
                pour connaître cette dimension vécue. En disposant de cartes
                capables d'aborder les engagements affectifs, les imaginaires
                sociaux et les mémoires collectives, nous pouvons donner plus
                d'importance à nos communautés dans les conversations sur
                l'avenir de nos villes.
              </p>
              <h4>Cartographies affectives</h4>
              <p>
                La série des cartographies affectives propose une manière
                alternative à la représentation de l'espace urbain de la commune
                de Vernier à travers quinze entretiens menés à pied avec des
                habitant.e.s de Vernier. Ces cartes tentent de dessiner les
                engagements affectifs des citoyen.ne.s avec leurs environnements
                quotidiens en mettant en évidence les perceptions, les paysages
                vécus et l'expérience plutôt que des lignes administratives ou
                des symboles abstraits. Une image collective émerge à
                l'intersection des expériences individuelles. Les paysages
                habités se superposent et proposent une nouvelle figure de la
                commune aux limites diffuses et aux réalités complexes. En
                reconnaissant l'espace vécu d'une ville dans des cartes qui
                peuvent être collectivement partagées, discutées et
                transformées, nous pouvons élargir nos imaginaires urbains et
                améliorer la façon dont nous planifions et concevons nos villes.
              </p>
              <h4>Atlas des paysages de la mobilité</h4>
              <p>
                L'Atlas des paysages de mobilité est une série de témoignages de
                citoyen.ne.s et de données d'information géographique rassemblés
                autour de l'expérience de la marche et du vélo à Vernier. La
                mobilité est bien plus que le fait de relier un point A à un
                point B, elle est surtout définie par l'expérience du parcours.
                De ce fait, la mobilité est un point d'entrée extraordinaire
                pour comprendre les liens entre les pratiques quotidiennes et
                l'environnement qui nous entoure. La série est organisée selon
                10 grands thèmes et 49 sous-thématiques décrivant des
                expériences faites en se déplaçant dans la commune de Vernier.
                L'utilisateur peut naviguer librement sur la carte pour
                comprendre les relations entre les caractéristiques
                environnementales de divers lieux de la commune et les
                imaginaires et perceptions collectives qui les animent.
              </p>
              <p>
                L’Atlas inclut également quelques premières analyses du
                questionnaire participatif (MAPTIONNAIRE) venant de clore et
                réalisé sur la commune de Vernier entre février et juin 2022.
                Une analyse plus approfondie du questionnaire sera réalisée par
                la suite.
              </p>
              <p>
                Cet outil de visualisation a été créé grâce à la participation
                de l'équipe IT4R (ENAC-IT 4 RESEARCH) de l'EPFL dans le cadre du
                projet de recherche
                <span class="font-weight-bold">PLHEBICITE</span> (Planifier des
                villes plus saines et plus riches en biodiversité: relier les
                quartiers grâce à une mobilité active et des infrastructures
                paysagères). Ce projet est une collaboration entre les
                laboratoires ALICE (Atelier de la Conception de l’Espace) et
                LASIG (Laboratoire des Systèmes d'Information Géographique) de
                l'EPFL, afin d'étudier de quelle manière l'espace urbain
                influence et potentialise les pratiques de mobilité active ainsi
                que le bien-être et la santé physique et psychologique des
                habitant.e.s de la commune de Vernier dans le canton de Genève.
              </p>
              <h4>Remerciements</h4>
              <p>
                Nous remercions les nombreuses personnes qui nous ont aidé dans
                la recherche et qui ont participé au projet. En particuliers les
                habitant.e.s nous ayant guidé à travers la commune durant les
                entretiens en marchant. Nous remercions également le service de
                la cohésion sociale, les contrats de quartiers, les personnes
                rencontrées dans des associations ou dans les différents
                quartiers, le service de la culture et communication, le service
                de l’aménagement.
              </p>
            </template>
          </simple-dialog>
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
          <div class="flex-even legend">
            <div class="ma-3">
              <template v-if="selectedCategoryId === 'mapping'">
                <h4>Description</h4>
                <p>
                  Ces cartes tentent de dessiner les engagements affectifs des
                  citoyens avec leur environnement quotidien, en mettant en
                  évidence leurs perceptions, leurs paysages et leurs
                  expériences. La compréhension et la spatialité de la commune
                  évolue selon qui l’habite. Une image collective et partagée
                  émerge à l'intersection des expériences individuelles. Les
                  paysages habités se superposent et proposent une nouvelle
                  figure de la commune aux limites diffuses et aux réalités
                  complexes.
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
                    de marche, la couleur selon la pente du parcours. Les
                    entretiens durent entre 50 minutes et 3 heures.
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
import SimpleDialog from "@/components/SimpleDialog.vue";
import WebMap, {
  HeatmapMapItem,
  MapGroupItem,
  MapItem,
  RasterTileMapItem,
  TileMapItem,
  UrlMapItem,
} from "@/components/WebMap.vue";
import { Metadata } from "@/models/qgis";
import { HeatLayerOptions } from "@/plugins/leaflet-heat";
import { EPSG_2056, tileLayerProps } from "@/utils/leaflet";
import { getBooleanFromString } from "@/utils/utils";
import { TreeviewItem } from "@/utils/vuetify";
import axios from "axios";
import { Feature } from "geojson";
import { Bounds, IconOptions, point, Proj, TileLayerOptions } from "leaflet";
import { random } from "lodash";
import { Component, Ref, Vue, Watch } from "vue-property-decorator";
import { mapMutations } from "vuex";

@Component({
  components: {
    ColorBox,
    SimpleDialog,
    WebMap,
  },
  methods: {
    ...mapMutations(["toggleAppBar"]),
  },
})
export default class Plhebicite extends Vue {
  toggleAppBar!: () => void;
  readonly center = [46.2107, 6.0946];
  readonly minZoom = 20;
  readonly maxZoom = 25;
  readonly dems: string[] = [
    "04_DELTA_dem_tampon_1500.tif",
    "07_MD_dem_tampon_1500.tif",
  ].map((filename) => this.getDataUrl(filename));
  getInterviewChildren(id: string): Layer[] {
    return [
      {
        name: "Voix",
        items: [
          {
            type: "url",
            url: `interview/voix/int_${id}_voices_callout.geojson`,
            style:
              "interview/voix/symbol/symbol_constellation_voices_callout.sld",
          },
          {
            type: "url",
            url: `interview/voix/int_${id}_voices_pts.geojson`,
            popup: "Text Content",
            getIconOptions: function (feature: Feature): IconOptions {
              const properties = feature.properties as Record<string, string>;
              const farAway = properties["far_away"];
              const popupAnchor = point(186, 0);
              switch (farAway) {
                case "false":
                  return {
                    iconUrl: "img/legends/voices.png",
                    iconSize: [50, 50],
                    popupAnchor: popupAnchor,
                  };
                case "in":
                  return {
                    iconUrl: "img/legends/voices-in.svg",
                    iconSize: [20, 20],
                    popupAnchor: popupAnchor,
                  };
                case "out":
                  return {
                    iconUrl: "img/legends/voices.png",
                    iconSize: [25, 25],
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
                popupAnchor: popupAnchor,
              };
            },
          },
        ],
      },
      {
        name: "Parcours",
        items: [
          {
            type: "url",
            url: `interview/parcours/int_${id}_parcours.geojson`,
            style: true,
          },
        ],
      },
      {
        name: "Constellation",
        items: [
          {
            type: "url",
            url: `interview/constellation/${id}/metadata.json`,
          },
        ],
      },
      {
        name: "Horizons",
        items: [
          {
            type: "tile",
            url: `interview/horizons/int_${id}_horizons/{z}/{x}/{y}.png`,
            crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
              origin: [2493710.47854159307, 1121568.0334584068],
              resolutions: [
                27.0666760742400001, 13.5333380371200001, 6.76666901856000003,
                3.38333450928000001, 1.69166725464000001, 0.845833627320000003,
                0.422916813660000002,
              ],
              bounds: new Bounds(
                [2493710.47854159307, 1121568.0334584068],
                [2499704.47854159633, 1115574.03345840354]
              ),
            }),
          },
        ],
      },
    ];
  }
  readonly categories: Category[] = [
    {
      id: "mapping",
      name: "Cartographie affective de Vernier",
      description:
        "Ces cartographies affectives représentent l'espace urbain vécu dans Vernier à travers quinze entretiens réalisés avec des habitant.e.s nous guidant à travers la commune.",
      active: true,
      layers: [
        {
          name: "01 La forêt tropicale",
          children: this.getInterviewChildren("01"),
        },
        {
          name: "02 Ville-dortoir",
          children: this.getInterviewChildren("02"),
        },
        {
          name: "03 Une barrière bleue",
          children: this.getInterviewChildren("03"),
        },
        {
          name: "04 Passages secrets",
          children: this.getInterviewChildren("04"),
        },
        {
          name: "05 Archipels et deltas",
          children: this.getInterviewChildren("05"),
        },
        {
          name: "06 Territoires DOM-TOM",
          children: this.getInterviewChildren("06"),
        },
        {
          name: "07 Jeux de pistes",
          children: this.getInterviewChildren("07"),
        },
        {
          name: "08 Au plateau des pins",
          children: this.getInterviewChildren("08"),
        },
        {
          name: "09 Sous les pavés, la Cité",
          children: this.getInterviewChildren("09"),
        },
        {
          name: "10 Le nom des rues",
          children: this.getInterviewChildren("10"),
        },
        {
          name: "11 Une histoire de cailloux",
          children: this.getInterviewChildren("11"),
        },
        {
          name: "12 L'invention d'une ritournelle",
          children: this.getInterviewChildren("12"),
        },
        {
          name: "13 La campagne Naville",
          children: this.getInterviewChildren("13"),
        },
        {
          name: "14 Le coin de terre",
          children: this.getInterviewChildren("14"),
        },
        {
          name: "15 Là où l'on revient",
          children: this.getInterviewChildren("15"),
        },
      ],
    },
    {
      id: "atlas",
      name: "Atlas des paysages de mobilité",
      description:
        "Cet Atlas, organisé selon dix grands thèmes et presque cinquante sous-thèmes, recueille une série de voix (citations) sur la relation entre mobilité et environnement. Ces cartes sont constituées autant de témoignages de citoyen.ne.s, que de sources historiques et d’analyses géographiques. ",
      active: false,
      layers: [
        {
          name: "Attachement au lieu et étendue spatiale",
          children: [
            {
              name: "Voix",
              children: [
                {
                  name: "Attachement",
                },
                {
                  name: "Lieux familiers (et affectionnés)",
                },
                {
                  name: "Spatialités étendues",
                },
                {
                  name: "Toponymes",
                },
                {
                  name: "Voisinage",
                },
              ],
            },
            {
              name: "Figures",
            },
            {
              name: "Cadre",
            },
          ],
        },
        {
          name: "Identité de la commune",
        },
        {
          name: "Imaginaires et savoirs oraux",
        },
        {
          name: "Expériences de mobilité",
          children: [
            {
              name: "Accessibilité",
              items: [
                {
                  type: "tile",
                  url: "general/mobility_index/20220614_hexa_range_code_grid_tot_vn_2056_v17_shp_df_weighted_20210917_ALL/{z}/{x}/{y}.png",
                  crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
                    origin: [2493617.3434664933, 1120234.04876646609],
                    resolutions: [
                      24.8222344368640009, 12.4111172184320004,
                      6.20555860921600022, 3.10277930460800011,
                      1.55138965230400006,
                    ],
                    bounds: new Bounds(
                      [2493617.3434664933, 1120234.04876646609],
                      [2499058.06697712326, 1116386.60242875223]
                    ),
                  }),
                },
              ],
            },
            {
              name: "Facilitateurs",
              items: [
                {
                  type: "heatmap",
                  url: "general/heatmaps/geojson_facilitateurs_20220614_tot_selection.geojson",
                  latitude: "latitude",
                  longitude: "longitude",
                },
                {
                  type: "url",
                  url: "general/heatmaps/geojson_facilitateurs_20220614_tot_selection.geojson",
                  popup: function (
                    properties: Record<string, string>
                  ): string | undefined {
                    return `<b>De quoi s'agit-il?</b>
                    ${properties["De quoi s'agit-il?"]}

                    <b>En quoi aide-t-il à la mobilité?</b>
                    ${properties["En quoi aide-t-il à la mobilité?"]}`;
                  },
                  getIconOptions: function (): IconOptions {
                    return {
                      iconUrl: "img/legends/blank.svg",
                      iconSize: [16, 16],
                    };
                  },
                },
              ],
            },
            {
              name: "Obstacles",
              items: [
                {
                  type: "heatmap",
                  url: "general/heatmaps/geojson_obstacles_20220614_tot_selection.geojson",
                  latitude: "latitude",
                  longitude: "longitude",
                  options: {
                    gradient: {
                      0.2: "blue",
                      0.4: "purple",
                      0.6: "orange",
                      1: "red",
                    },
                  },
                },
                {
                  type: "url",
                  url: "general/heatmaps/geojson_obstacles_20220614_tot_selection.geojson",
                  popup: function (
                    properties: Record<string, string>
                  ): string | undefined {
                    return `<b>De quoi s'agit-il?</b>
                    ${properties["De quoi s'agit-il?"]}

                    <b>En quoi aide-t-il à la mobilité?</b>
                    ${properties["En quoi fait-il obstacle à la mobilité ?"]}`;
                  },
                  getIconOptions: function (): IconOptions {
                    return {
                      iconUrl: "img/legends/blank.svg",
                      iconSize: [16, 16],
                    };
                  },
                },
              ],
            },
            {
              name: "Rythmes et occurrences",
            },
            {
              name: "Routes et chemins",
            },
            {
              name: "(Des)orientations",
            },
            {
              name: "Lieux impopulaires",
            },
            {
              name: "Voix",
              items: [
                {
                  type: "url",
                  url: "atlas/voix/atlas_voices_mobility_experiences.geojson",
                  style: true,
                  popup: "Text Content",
                },
              ],
            },
            {
              name: "Cadre",
              items: [
                {
                  type: "tile",
                  url: "ATLAS/mobility/cadre/plh_atlas_mobility_cadre/{z}/{x}/{y}.png",
                },
              ],
            },
            {
              name: "Overlay",
              items: [
                {
                  type: "tile",
                  url: "ATLAS/mobility/overlay/plh_atlas_mobility_overlay/{z}/{x}/{y}.png",
                },
              ],
            },
          ],
        },
        {
          name: "Sensibilité(s), au-delà du visuel",
        },
        {
          name: "Mémoire et temporalités plurielles",
        },
        {
          name: "Bien-être et perception des risques",
        },
        {
          name: "Pratiques situées",
        },
        {
          name: "Territorialité",
        },
        {
          name: "Écologies politiques",
        },
      ],
    },
    {
      id: "environment",
      name: "Contextes et fonds de carte",
      description:
        "Les supports de carte facilitent la lecture du territoire. Cependant ils tendent à figer ce même territoire en des images conventionnelles et bien souvent administratives ou routières. C’est pourquoi chaque chapitre propose différentes couches de cartes à tester par vous-même. <br>Vous trouverez dans cette section des cartes plus générales pour vous situer facilement.",
      active: false,
      layers: [
        {
          name: "Fond de carte ALICE",
          items: [
            {
              type: "tile",
              url: "general/basemap/{z}/{x}/{y}.png",
              options: {
                tms: true,
              },
            },
          ],
        },
        {
          name: "Swisstopo",
          items: [
            {
              type: "tile",
              ...tileLayerProps.swisstopo_pixelkarte_farbe_2056,
            },
          ],
        },
        {
          name: "Image satellite",
          items: [{ type: "tile", ...tileLayerProps.swisstopo_photo_2056 }],
        },
        {
          name: "Grille kilométrique",
          items: [
            {
              type: "tile",
              url: "general/grid_swisstopo/grid_swisstopo/{z}/{x}/{y}.png",
            },
          ],
        },
        {
          name: "Repère (TODO)",
          items: [
            {
              type: "url",
              url: "general/repere/GEOJSON/background_repere.geojson",
              style: true,
            },
          ],
          selected: false,
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

  created(): void {
    const layers = this.categories[0].layers;
    const preselectedIndex = random(layers.length - 1);
    layers[preselectedIndex].selected = true;
  }

  mounted(): void {
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
        const mapItems = await Promise.all(
          (item.value.items ?? []).map((layerItem) =>
            this.getMapItem(layerItem)
          )
        ).then((items) => items.flat());
        return {
          id: item.id,
          zIndex: zIndex--,
          children: mapItems,
        } as MapGroupItem;
      });
    Promise.all(promises).then((mapItems) => (this.mapItems = mapItems));
  }

  private async getMapItem(layerItem: LayerItem): Promise<MapItem[]> {
    if (!layerItem.url.startsWith("https://")) {
      layerItem.url = this.getDataUrl(layerItem.url);
    }
    switch (layerItem.type) {
      case "url": {
        if (layerItem.url.endsWith("metadata.json")) {
          const metadata = await axios
            .get<Metadata>(layerItem.url)
            .then((response) => response.data);
          const prefix = layerItem.url.replace("metadata.json", "");
          return metadata.layers.map(
            (layer) =>
              new UrlMapItem(prefix + layer.geojson, {
                styleUrl: prefix + layer.sld,
              })
          );
        } else {
          const styleUrl = layerItem.style
            ? typeof layerItem.style === "string"
              ? this.getDataUrl(layerItem.style)
              : layerItem.url.replace(/\.[^/.]+$/, ".sld")
            : undefined;
          return [
            new UrlMapItem(layerItem.url, {
              styleUrl: styleUrl,
              popup: layerItem.popup,
              getIconOptions: layerItem.getIconOptions,
            }),
          ];
        }
      }
      case "tile": {
        if (layerItem.crs) {
          return [
            new RasterTileMapItem(
              layerItem.url,
              layerItem.crs,
              layerItem.options
            ),
          ];
        } else {
          return [new TileMapItem(layerItem.url, layerItem.options)];
        }
      }
      case "heatmap":
        return [
          new HeatmapMapItem(
            layerItem.url,
            layerItem.latitude,
            layerItem.longitude,
            layerItem.options
          ),
        ];
      default:
        throw new Error("Expected type");
    }
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

type LayerItem = UrlLayerItem | TileLayerItem | HeatmapLayerItem;

interface UrlLayerItem {
  type: "url";
  url: string;
  popup?: string | ((properties: Record<string, string>) => string | undefined);
  style?: boolean | string;
  getIconOptions?: (feature: Feature) => IconOptions;
}
interface TileLayerItem {
  type: "tile";
  url: string;
  options?: TileLayerOptions;
  crs?: Proj.CRS;
}
interface HeatmapLayerItem {
  type: "heatmap";
  url: string;
  latitude?: string;
  longitude?: string;
  options?: HeatLayerOptions;
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
