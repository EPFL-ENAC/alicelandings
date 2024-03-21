<script setup lang="ts">
import ColorBox from "@/components/ColorBox.vue";
import LegendItem from "@/components/LegendItem.vue";
import LegendSource from "@/components/LegendSource.vue";
import SimpleDialog from "@/components/SimpleDialog.vue";
import VimeoPlayer from "@/components/VimeoPlayer.vue";
import WebMap from "@/components/WebMap.vue";
import { Metadata } from "@/models/qgis";
import { HeatLayerOptions } from "@/plugins/leaflet-heat";
import { useAppStore } from "@/stores/app";
import { EPSG_2056, swisstopoCrs, tileLayerProps } from "@/utils/leaflet";
import { getBooleanFromString } from "@/utils/utils";
import { TreeviewItem } from "@/utils/vuetify";
import {
  BaseLayer,
  HeatmapMapItem,
  MapGroupItem,
  MapItem,
  TileMapItem,
  UrlMapItem,
} from "@/utils/webMap";
import axios from "axios";
import { Feature } from "geojson";
import {
  Bounds,
  IconOptions,
  PathOptions,
  point,
  Proj,
  TileLayerOptions,
} from "leaflet";
import { chain, random } from "lodash";
import { onMounted, ref, watch } from "vue";

const appStore = useAppStore();
const baseLayers: BaseLayer[] = [
  {
    name: "None swisstopoCrs",
    url: "",
    visible: true,
    options: {
      maxZoom: 27,
    },
    crs: swisstopoCrs,
  },
];
const center: [number, number] = [46.2107, 6.0946];
const minZoom = 20;
const maxZoom = 26;
const dems: string[] = [
  "general/dem_altitude/swisssurface3d-raster_2019_merged.tif",
].map((filename) => getDataUrl(filename));

function popupFnParticipative(
  properties: Record<string, string>
): string | undefined {
  return `${ properties["Quelle raison / activité vous y amène ?"] ? `<p style="margin:0;padding:0;"> ${properties["Quelle raison / activité vous y amène ?"]}</p>` : ""}`;
}

function getIconOptionsParticipative(feature: Feature): IconOptions {
  const properties = feature.properties as Record<string, string>;
  if (properties["Quelle raison / activité vous y amène ?"]) {
    const popupAnchor = point(186, 0);
    return {
      iconUrl: "img/legends/voices.png",
      iconSize: [36, 36],
      popupAnchor: popupAnchor,
    };
  }
  return {
    iconUrl: "img/legends/voices-out.png",
    iconSize: [0, 0],
  };
}

const categories: Category[] = [
  {
    id: "mapping",
    name: "Cartographie affective de Vernier",
    description:
      "Ces cartographies affectives représentent l'espace urbain vécu dans Vernier à travers quinze entretiens réalisés avec des habitant.e.s nous guidant à travers la commune.",
    active: true,
    layers: [
      {
        name: "01 La forêt tropicale",
        children: getInterviewChildren("01"),
      },
      {
        name: "02 L'envers des citernes",
        children: getInterviewChildren("02"),
      },
      {
        name: "03 Une barrière bleue",
        children: getInterviewChildren("03"),
      },
      {
        name: "04 Passages secrets",
        children: getInterviewChildren("04"),
      },
      {
        name: "05 Archipels et deltas",
        children: getInterviewChildren("05"),
      },
      {
        name: "06 Territoires DOM-TOM",
        children: getInterviewChildren("06"),
      },
      {
        name: "07 Jeux de pistes",
        children: getInterviewChildren("07"),
      },
      {
        name: "08 Au plateau des pins",
        children: getInterviewChildren("08"),
      },
      {
        name: "09 Sous les pavés, la Cité",
        children: getInterviewChildren("09", false),
      },
      {
        name: "10 Le nom des rues",
        children: getInterviewChildren("10"),
      },
      {
        name: "11 Une histoire de cailloux",
        children: getInterviewChildren("11"),
      },
      {
        name: "12 L'invention d'une ritournelle",
        children: getInterviewChildren("12", false),
      },
      {
        name: "13 La campagne Naville",
        children: getInterviewChildren("13"),
      },
      {
        name: "14 Le coin de terre",
        children: getInterviewChildren("14"),
      },
      {
        name: "15 Là où l'on revient",
        children: getInterviewChildren("15"),
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
        children: getAtlasChildren("01", "attachment", [
          {
            name: "Attachement",
            id: "attachment",
          },
          {
            name: "Lieux familiers (et affectionnés)",
            id: "familiar",
          },
          {
            name: "Spatialités étendues",
            id: "extended_spatialities",
          },
          {
            name: "Toponymes",
            id: "toponymes",
          },
          {
            name: "Voisinage",
            id: "voisinage",
          },
        ]),
      },
      {
        name: "Identité de la commune",
        children: getAtlasChildren("02", "identity", [
          {
            name: "Identité générale de la commune",
            id: "of_commune",
          },
          {
            name: "Appartenance et appropriation",
            id: "appartenance",
          },
          {
            name: "Paysage et patrimoine culturel",
            id: "patrimoine",
          },
        ]),
      },
      {
        name: "Imaginaires et savoirs oraux",
        children: getAtlasChildren("03", "imaginary", [
          {
            name: "Expressions, histoires et mystères",
            id: "expressions",
          },
          {
            name: "Images, analogies et métaphores",
            id: "analogies",
          },
          {
            name: "Spéculations et futures",
            id: "speculations",
          },
          {
            name: "Lieux imaginaires",
            id: "places",
          },
        ]),
      },
      {
        name: "Expériences de mobilité",
        children: [
          {
            name: "Analyses",
            children: [
              {
                name: "Accessibilité",
                items: [
                  {
                    type: "tile",
                    url: "atlas/analyses/mobility_index/20220614_hexa_range_code_grid_tot_vn_2056_v17_shp_df_weighted_20210917_ALL/{z}/{x}/{y}.png",
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
                    url: "atlas/analyses/facilitators_obstacles/geojson_facilitateurs_20220622_tot_selection.geojson",
                    latitude: "latitude",
                    longitude: "longitude",
                  },
                  {
                    type: "url",
                    url: "atlas/analyses/facilitators_obstacles/geojson_facilitateurs_20220622_tot_selection.geojson",
                    style:
                      "atlas/analyses/facilitators_obstacles/20220627_facilitators_circles.sld",
                    popup: function (
                      properties: Record<string, string>
                    ): string | undefined {
                      return `<b>De quoi s'agit-il?</b>
                    ${properties["what"]}

                    <b>En quoi aide-t-il à la mobilité?</b>
                    ${properties["why"]}`;
                    },
                    // getIconOptions: function (): IconOptions {
                    //   return {
                    //     iconUrl: "img/legends/blank.svg",
                    //     iconSize: [16, 16],
                    //   };
                    // },
                  },
                ],
              },
              {
                name: "Obstacles",
                items: [
                  {
                    type: "heatmap",
                    url: "atlas/analyses/facilitators_obstacles/geojson_obstacles_20220622_tot_selection.geojson",
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
                    url: "atlas/analyses/facilitators_obstacles/geojson_obstacles_20220622_tot_selection.geojson",
                    // style:
                    //   "atlas/analyses/facilitators_obstacles/20220627_obstacles_cross.sld",
                    popup: function (
                      properties: Record<string, string>
                    ): string | undefined {
                      return `<b>De quoi s'agit-il?</b>
                    ${properties["what"]}

                    <b>En quoi entrave-t-il la mobilité?</b>
                    ${properties["why"]}`;
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
            ],
          },
          ...getAtlasChildren("04", "mobility", [
            {
              name: "Mobilité",
              id: "gen",
            },
            {
              name: "Rythmes et occurrences",
              id: "rythm",
            },
            {
              name: "Routes et chemins",
              id: "roads",
            },
            {
              name: "(Des)orientations",
              id: "orientation",
            },
            {
              name: "Lieux impopulaires",
              id: "unpopular_places",
            },
          ]),
        ],
      },
      {
        name: "Dimensions non visuelles",
        children: getAtlasChildren(
          "05",
          "non_visual",
          [
            {
              name: "Attention au paysage",
              id: "awareness",
            },
            {
              name: "Son et olfaction",
              id: "senses",
            },
          ],
          {
            figureType: "none",
          }
        ),
      },
      {
        name: "Mémoire et temporalités plurielles",
        children: getAtlasChildren("06", "memory", [
          {
            name: "Mémoire",
            id: "memory",
          },
          {
            name: "Réalité plurielle et frictions",
            id: "friction",
          },
          {
            name: "Lieux disparus et traces",
            id: "traces",
          },
          {
            name: "Transformations et mutations",
            id: "mutations",
          },
          {
            name: "Temporalités plurielles",
            id: "plural",
          },
        ]),
      },
      {
        name: "Bien-être et perception des risques",
        children: getAtlasChildren("07", "risk", [
          {
            name: "Nuisances",
            id: "nuisances",
          },
          {
            name: "Perception des risques",
            id: "perception",
          },
          {
            name: "Bien-être (et mal-être)",
            id: "wellbeing",
          },
        ]),
      },
      {
        name: "Pratiques situées",
        children: getAtlasChildren("08", "situated", [
          {
            name: "Paysage animé",
            id: "landscape",
          },
          {
            name: "Rituels et habitudes",
            id: "rituals",
          },
          {
            name: "Pratiques situées",
            id: "practices",
          },
        ]),
      },
      {
        name: "Territorialité",
        children: getAtlasChildren("09", "territoriality", [
          {
            name: "Infrastructures et industries (fantômes)",
            id: "ghosted",
          },
          {
            name: "Interfaces et sols communs",
            id: "interfaces",
          },
          {
            name: "Archipel et micro-territoires",
            id: "archipel",
          },
          {
            name: "Centrifuge et centripète",
            id: "centrifuge",
          },
          {
            name: "Continuité et discontinuité",
            id: "continuity",
          },
          {
            name: "Îles inaccessibles",
            id: "islands",
          },
          {
            name: "Frontières et limites",
            id: "borders",
          },
          {
            name: "Territoires inexplorés",
            id: "uncharted",
          },
          {
            name: "Matérialités (attention aux détails)",
            id: "materialities",
          },
          {
            name: "Qualité spatiale",
            id: "spatial_quality",
          },
        ]),
      },
      {
        name: "Écologies politiques",
        children: getAtlasChildren("10", "political", [
          {
            name: "Sphère politique",
            id: "realms",
          },
          {
            name: "Promoteurs, investisseurs et densification",
            id: "promotors",
          },
          {
            name: "Propriété (privé/public)",
            id: "property",
          },
          {
            name: "Savoirs-faire, initiatives et résistances",
            id: "savoirfaires",
          },
          {
            name: "Panorama social",
            id: "social",
          },
        ]),
      },
    ],
  },
  {
    id: "participative",
    name: "Cartographie participative",
    description: "Cette cartographie particative est en cours de construction.",
    active: false,
    layers: [
      {
        name: "01 Aïre et Libellules",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `aire_libellules/limites/aire_libellules_limites.geojson`,
                style: `aire_libellules/limites/aire_libellules_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `aire_libellules/parcours/aire_libellules_parcours_pieton.geojson`,
                    style: `aire_libellules/parcours/aire_libellules_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `aire_libellules/parcours/aire_libellules_parcours_velo.geojson`,
                    style: `aire_libellules/parcours/aire_libellules_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `aire_libellules/voix/aire_libellules_voix.geojson`,
                // style: `aire_libellules/voix/aire_libellules_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `aire_libellules/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `aire_libellules/symboles/aire_libellules_symboles_etiquette.geojson`,
                style: `aire_libellules/symboles/aire_libellules_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `aire_libellules/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `aire_libellules/lieux_vecus/aire_libellules_lieux_vecus_etiquette.geojson`,
                style: `aire_libellules/lieux_vecus/aire_libellules_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
      },
      {
        name: "02 Avanchets",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `avanchets/limites/avanchets_limites.geojson`,
                style: `avanchets/limites/avanchets_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `avanchets/parcours/avanchets_parcours_pieton.geojson`,
                    style: `avanchets/parcours/avanchets_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `avanchets/parcours/avanchets_parcours_velo.geojson`,
                    style: `avanchets/parcours/avanchets_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `avanchets/voix/avanchets_voix.geojson`,
                // style: `avanchets/voix/avanchets_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `avanchets/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `avanchets/symboles/avanchets_symboles_etiquette.geojson`,
                style: `avanchets/symboles/avanchets_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `avanchets/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `avanchets/lieux_vecus/avanchets_lieux_vecus_etiquette.geojson`,
                style: `avanchets/lieux_vecus/avanchets_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
      },
      {
        name: "03 Châtelaine",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `chatelaine/limites/chatelaine_limites.geojson`,
                style: `chatelaine/limites/chatelaine_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `chatelaine/parcours/chatelaine_parcours_pieton.geojson`,
                    style: `chatelaine/parcours/chatelaine_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `chatelaine/parcours/chatelaine_parcours_velo.geojson`,
                    style: `chatelaine/parcours/chatelaine_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `chatelaine/voix/chatelaine_voix.geojson`,
                // style: `chatelaine/voix/chatelaine_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `chatelaine/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `chatelaine/symboles/chatelaine_symboles_etiquette.geojson`,
                style: `chatelaine/symboles/chatelaine_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `chatelaine/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `chatelaine/lieux_vecus/chatelaine_lieux_vecus_etiquette.geojson`,
                style: `chatelaine/lieux_vecus/chatelaine_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
      },
      {
        name: "04 Cointrin",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `cointrin/limites/cointrin_limites.geojson`,
                style: `cointrin/limites/cointrin_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `cointrin/parcours/cointrin_parcours_pieton.geojson`,
                    style: `cointrin/parcours/cointrin_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `cointrin/parcours/cointrin_parcours_velo.geojson`,
                    style: `cointrin/parcours/cointrin_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `cointrin/voix/cointrin_voix.geojson`,
                // style: `cointrin/voix/cointrin_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `cointrin/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `cointrin/symboles/cointrin_symboles_etiquette.geojson`,
                style: `cointrin/symboles/cointrin_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `cointrin/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `cointrin/lieux_vecus/cointrin_label_lieux_vecus.geojson`,
                style: `cointrin/lieux_vecus/cointrin_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
      },
      {
        name: "05 L'Étang",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `etang/limites/etang_limites.geojson`,
                style: `etang/limites/etang_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `etang/parcours/etang_parcours_pieton.geojson`,
                    style: `etang/parcours/etang_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `etang/parcours/etang_parcours_velo.geojson`,
                    style: `etang/parcours/etang_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `etang/voix/etang_voix.geojson`,
                // style: `etang/voix/etang_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `etang/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `etang/symboles/etang_symboles_etiquette.geojson`,
                style: `etang/symboles/etang_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `etang/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `etang/lieux_vecus/etang_lieux_vecus_etiquette.geojson`,
                style: `etang/lieux_vecus/etang_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
      },
      {
        name: "06 Lignon",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `lignon/limites/lignon_limites.geojson`,
                style: `lignon/limites/lignon_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `lignon/parcours/lignon_parcours_pieton.geojson`,
                    style: `lignon/parcours/lignon_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `lignon/parcours/lignon_parcours_velo.geojson`,
                    style: `lignon/parcours/lignon_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `lignon/voix/lignon_voix.geojson`,
                // style: `lignon/voix/lignon_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `lignon/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `lignon/symboles/lignon_symboles_etiquette.geojson`,
                style: `lignon/symboles/lignon_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `lignon/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `lignon/lieux_vecus/lignon_lieux_vecus_etiquette.geojson`,
                style: `lignon/lieux_vecus/lignon_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
      },
      {
        name: "07 Vernier-Village",
        children: [
          {
            name: "Limites",
            items: [
              {
                type: "url",
                url: `village/limites/village_limites.geojson`,
                style: `village/limites/village_limites.sld`,
              },
            ],
          },
          {
            name: "Itinéraires",
            children: [
              {
                name: "Piétons",
                items: [
                  {
                    type: "url",
                    url: `village/parcours/village_parcours_pieton.geojson`,
                    style: `village/parcours/village_parcours_pieton.sld`,
                  },
                ],
              },
              {
                name: "Cyclables",
                items: [
                  {
                    type: "url",
                    url: `village/parcours/village_parcours_velo.geojson`,
                    style: `village/parcours/village_parcours_velo.sld`,
                  },
                ],
              },
            ],
          },
          {
            name: "Voix",
            items: [
              {
                type: "url",
                url: `village/voix/village_voix.geojson`,
                // style: `village/voix/village_voix.sld`,
                // popup: "Text Content",
                popup: popupFnParticipative,
                getIconOptions: getIconOptionsParticipative,
              },
            ],
          },
          {
            name: "Symboles",
            items: [
              {
                type: "url",
                url: `village/symboles/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `village/symboles/village_symboles_etiquette.geojson`,
                style: `village/symboles/village_symboles_etiquette.sld`,
              },
            ],
          },
          {
            name: "Lieux vécus",
            items: [
              {
                type: "url",
                url: `village/lieux_vecus/bulk_export/metadata.json`,
              },
              {
                type: "url",
                url: `village/lieux_vecus/village_lieux_vecus_etiquette.geojson`,
                style: `village/lieux_vecus/village_lieux_vecus_etiquette.sld`,
              },
            ],
          },
        ],
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
            url: "general/basemap/general_basemap/{z}/{x}/{y}.png",
            crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
              origin: [2491284.60725472914, 1123583.6651326362],
              resolutions: [
                54.1325883203840021, 27.0662941601920011, 13.5331470800960005,
                6.76657354004800027, 3.38328677002400013, 1.69164338501200007,
                0.845821692506000034,
              ],
              bounds: new Bounds(
                [2491284.60725472914, 1123583.6651326362],
                [2501274.60726491734, 1113593.66512244777]
              ),
            }),
          },
        ],
      },
      {
        name: "Carte Nationale",
        items: [
          {
            type: "tile",
            ...tileLayerProps.swisstopo_pixelkarte_farbe_2056,
          },
        ],
      },
      {
        name: "Photo aérienne",
        items: [{ type: "tile", ...tileLayerProps.swisstopo_photo_2056 }],
      },
      {
        name: "Grille kilométrique",
        items: [
          {
            type: "url",
            url: "general/grid/general_grid_km.geojson",
            style: true,
          },
        ],
      },
    ],
  },
];
const lasiglegendItems: { color: string; text: string }[] = [
  {
    color: "#1a9641",
    text: "0.000 - 0.077 : Espace particulièrement favorable à la mobilité piétonne",
  },
  {
    color: "#a6d96a",
    text: "0.077 - 0.223 : Espace modérément favorable à la mobilité piétonne",
  },
  {
    color: "#ffffc0",
    text: "0.223 - 0.373 : Espace neutre en termes de mobilité piétonne",
  },
  {
    color: "#fdae61",
    text: "0.373 - 0.596 : Espace modérément défavorable à la mobilité piétonne",
  },
  {
    color: "#d7191c",
    text: "0.596 - 1.000 : Espace particulièrement défavorable à la mobilité piétonne",
  },
];

const webMap = ref<InstanceType<typeof WebMap>>();
const zoom = ref<number>(22);
const selectedTreeviewItems = ref<TreeviewItem<Layer>[][]>([]);
const mapItems = ref<MapGroupItem[]>([]);
const selectedCategoryId = ref<CategoryId>("mapping");
const lastSelectedLayerIds = ref<Set<string>>(new Set());
const lastSelectedLayerId = ref<string>("");
const fullscreen = ref<boolean>(false);

function getInterviewChildren(id: string, voiceCallout = true): Layer[] {
  return [
    {
      name: "Voix",
      items: [
        ...(voiceCallout
          ? [
              {
                type: "url",
                url: `interview/voix/int_${id}_voices_callout.geojson`,
                style:
                  "interview/voix/symbol/symbol_constellation_voices_callout.sld",
              } as LayerItem,
            ]
          : []),
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
                  iconSize: [40, 40],
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
                  iconSize: [20, 20],
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
function getAtlasChildren(
  id: string,
  name: string,
  voices: {
    name: string;
    id: string;
  }[],
  option?: {
    cadreType?: "url" | "tile" | "all";
    figureType?: "url" | "tile" | "none";
    figure?: string[];
  }
): Layer[] {
  const cadreType = option?.cadreType ?? "tile";
  const figureType = option?.figureType ?? "tile";
  const figure = option?.figure ?? [""];
  const cadreItems: LayerItem[] = [];
  if (cadreType === "url" || cadreType === "all") {
    cadreItems.push({
      type: "url",
      url: `atlas/cadre/${id}/metadata.json`,
    });
  }
  if (cadreType === "tile" || cadreType === "all") {
    cadreItems.push({
      type: "tile",
      url: `atlas/cadre/atlas_${id}_${name}_cadre/{z}/{x}/{y}.png`,
      crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
        origin: [2491284.74821705418, 1123583.5241703114],
        resolutions: [
          72.1788214780160047, 36.0894107390080023, 18.0447053695040012,
          9.02235268475200058, 4.51117634237600029, 2.25558817118800015,
          1.12779408559400007, 0.563897042797000037,
        ],
        bounds: new Bounds(
          [2491284.74821705418, 1123583.5241703114],
          [2501274.74822724564, 1113593.5241601197]
        ),
      }),
    });
  }
  const figureItems: LayerItem[] = [];
  if (figureType === "url") {
    figureItems.push(
      ...figure.map(
        (suffix) =>
          ({
            type: "url",
            url: `atlas/figure/atlas_${id}_${name}${suffix}_figure.geojson`,
            style: true,
          } as LayerItem)
      )
    );
  }
  if (figureType === "tile") {
    figureItems.push({
      type: "tile",
      url: `atlas/figure/atlas_${id}_${name}_figure/{z}/{x}/{y}.png`,
      crs: new Proj.CRS("EPSG:2056", EPSG_2056, {
        origin: [2491284.74821705418, 1123583.5241703114],
        resolutions: [
          72.1788214780160047, 36.0894107390080023, 18.0447053695040012,
          9.02235268475200058, 4.51117634237600029, 2.25558817118800015,
          1.12779408559400007, 0.563897042797000037,
        ],
        bounds: new Bounds(
          [2491284.74821705418, 1123583.5241703114],
          [2501274.74822724564, 1113593.5241601197]
        ),
      }),
    });
  }
  return [
    {
      name: "Voix",
      children: voices.map((voice) => ({
        name: voice.name,
        items: [
          {
            type: "url",
            url: `atlas/voix/${id}_${name}/atlas_${id}_${name}_${voice.id}.geojson`,
            style: `atlas/voix/${id}_${name}/atlas_${id}_${name}_voices.sld`,
            options: {
              fillOpacity: 0.66,
            },
            popup: function (
              properties: Record<string, string>
            ): string | undefined {
              return `<b>${voice.name}</b>

                ${properties["Text Content"]}`;
            },
          },
        ],
      })),
    },
    ...(figureItems.length > 0
      ? [
          {
            name: "Figures",
            items: figureItems,
          } as Layer,
        ]
      : []),
    {
      name: "Cadre",
      items: cadreItems,
    },
  ];
}
async function getMapItem(layerItem: LayerItem): Promise<MapItem[]> {
  if (!layerItem.url.startsWith("https://")) {
    layerItem.url = getDataUrl(layerItem.url);
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
              pathOptions: layerItem.options,
            })
        );
      } else {
        const styleUrl = layerItem.style
          ? typeof layerItem.style === "string"
            ? getDataUrl(layerItem.style)
            : layerItem.url.replace(/\.[^/.]+$/, ".sld")
          : undefined;
        return [
          new UrlMapItem(layerItem.url, {
            styleUrl: styleUrl,
            pathOptions: layerItem.options,
            popup: layerItem.popup,
            getIconOptions: layerItem.getIconOptions,
          }),
        ];
      }
    }
    case "tile": {
      return [new TileMapItem(layerItem.url, layerItem.options, layerItem.crs)];
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
function getDataUrl(path: string): string {
  return `${process.env.VUE_APP_DATA_URL}/${path}`;
}
function getTreeviewItems(
  layers: Layer[],
  idPrefix: string,
  predicate: (layer: Layer) => boolean = () => true,
  parents: Layer[] = []
): TreeviewItem<Layer>[] {
  return layers.filter(predicate).map((layer) => {
    const parentLayers = [...parents, layer];
    const children = layer.children
      ? getTreeviewItems(layer.children, idPrefix, predicate, parentLayers)
      : undefined;
    const parentNames = parentLayers.map((parent) => parent.name);
    parentNames.unshift(idPrefix);
    const id = parentNames.join("/");
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
function clickCategory(category: Category): void {
  if (!category.active) {
    selectedCategoryId.value = category.id;
    switch (category.id) {
      case "mapping":
        selectedTreeviewItems.value[1] = [];
        break;
      case "atlas":
        selectedTreeviewItems.value[0] = [];
        break;
    }
  }
}
function clickLayer(): void {
  const selectedLayerIds = selectedTreeviewItems.value
    .flat()
    .map((item) => item.id);
  let newIds = new Set(
    selectedLayerIds.filter((id) => !lastSelectedLayerIds.value.has(id))
  );
  lastSelectedLayerIds.value = new Set(selectedLayerIds);
  while (newIds.size > 1) {
    const index = chain(Array.from(newIds))
      .map((id) => id.lastIndexOf("/"))
      .max()
      .value();
    newIds = new Set(Array.from(newIds).map((id) => id.substring(0, index)));
  }
  if (newIds.size > 0) {
    lastSelectedLayerId.value = newIds.values().next().value;
  }
}

onMounted(() => {
  const layers = categories[0].layers;
  const preselectedIndex = random(layers.length - 1);
  layers[preselectedIndex].selected = true;

  selectedTreeviewItems.value = categories.map((category) =>
    getTreeviewItems(category.layers, category.id, (layer) => !!layer.selected)
  );
});

watch(fullscreen, () => window.dispatchEvent(new Event("resize")));
watch(
  selectedTreeviewItems,
  async (value) => {
    let zIndex = 0;
    const items: MapGroupItem[] = await Promise.all(
      value
        .flat()
        .flatMap((item) => item.children ?? [item])
        .map(async (item) => {
          const mapItems = await Promise.all(
            (item.value.items ?? [])
              .filter((layerItem): layerItem is LayerItem => !!layerItem)
              .map((layerItem) => getMapItem(layerItem))
          ).then((items) => items.flat());
          return {
            id: item.id,
            zIndex: zIndex--,
            children: mapItems,
          } as MapGroupItem;
        })
    );
    items.push({
      id: "repere",
      zIndex: zIndex--,
      children: [
        new UrlMapItem(
          getDataUrl("general/repere/general_background_repere.geojson"),
          {
            styleUrl: getDataUrl(
              "general/repere/general_background_repere.sld"
            ),
          }
        ),
      ],
    });
    mapItems.value = items;
  },
  {
    deep: true,
  }
);

type CategoryId = "mapping" | "atlas" | "environment" | "participative";

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
  options?: PathOptions;
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
        />
      </a>
      <v-btn
        icon
        color="primary"
        class="ml-3"
        @click="fullscreen = !fullscreen"
      >
        <v-icon x-large>{{
          fullscreen ? "mdi-fullscreen-exit" : "mdi-fullscreen"
        }}</v-icon>
      </v-btn>
      <v-btn icon color="primary" class="ml-3" @click="appStore.toggleAppBar">
        <v-icon x-large>mdi-menu</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="flex-grow-1 d-flex flex-row">
      <div v-if="!fullscreen" class="d-flex flex-column">
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
              <template #activator>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-black">
                    <h3>{{ item.name }}</h3>
                  </v-list-item-title>
                </v-list-item-content>
              </template>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <p class="mx-3" v-html="item.description" />
              <v-treeview
                v-model="selectedTreeviewItems[index]"
                dense
                :items="getTreeviewItems(item.layers, item.id)"
                off-icon="mdi-square-outline"
                on-icon="mdi-square"
                indeterminate-icon="mdi-square"
                return-object
                selectable
                selected-color="secondary"
                @input="clickLayer"
              />
            </v-list-group>
          </v-list>
        </div>
        <v-divider />
        <div class="d-flex">
          <simple-dialog class="flex-even">
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" class="flex-even btn-left" text v-on="on">
                Infos
              </v-btn>
            </template>
            <template #default>
              <h1>INFOS _________________________________</h1>
              <br />
              <h2>Le projet Plhebicite</h2>
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
              <h2>Partenaires</h2>
              <p>
                Commune de Vernier<br />
                Office de l'urbanisme du canton de Genève<br />
                Hélène Mariéthoz<br />
                <a
                  href="https://www.epfl.ch/schools/enac/about/data-at-enac/enac-it4research/"
                  target="_blank"
                >
                  ENAC-IT4R
                </a>
              </p>
              <h2>Remerciements</h2>
              <p>
                Nous remercions les nombreuses personnes qui nous ont aidé au
                cours de la recherche, qui ont participé aux différentes phases
                et rendu ce projet possible. Un merci particulier aux
                habitant.e.s de la commune nous ayant guidé à travers Vernier
                durant les entretiens en marchant.<br />
                Nous remercions également à Vernier : le Service de la Cohésion
                Sociale, les Contrats de Quartiers, les personnes rencontrées
                dans des associations, le Service de la Culture et
                Communication, le Service de l’Aménagement.<br />
                Nous remercions, de la même façon, au canton, Frédéric Josselin,
                Chef de service, République et Canton de Genève, Département du
                territoire (DT), Office de l'urbanisme et Service concertation
                communication.<br />
                Nous remercions tous les habitant.e.s qui ont répondu au
                questionnaire en ligne.<br />
                Merci finalement à Julien Heil pour ses photographies, à Nagy
                Makhlouf, Yann Bergeot et Camille Claessens Vallet.
              </p>
              <h2>Equipe</h2>
              <p>
                <a
                  href="https://people.epfl.ch/lucia.jalonoyarzun"
                  target="_blank"
                  >Lucía Jalón Oyarzun (ALICE)</a
                ><br />
                <a
                  href="https://people.epfl.ch/marco.vieiraruas"
                  target="_blank"
                  >Marco Vieira Ruas (LASIG)</a
                ><br />
                <a
                  href="https://people.epfl.ch/emmanuelle.agustoni"
                  target="_blank"
                  >Emmanuelle Agustoni (ALICE)</a
                ><br />
                <a href="https://people.epfl.ch/aurele.pulfer" target="_blank"
                  >Aurèle Pulfer (ALICE)</a
                ><br />
                <a href="https://people.epfl.ch/david.tang" target="_blank"
                  >David Tang (IT4R)</a
                ><br />
                <a href="https://people.epfl.ch/pierre.guilbert" target="_blank"
                  >Pierre guilbert (IT4R)</a
                ><br />
                <a href="https://people.epfl.ch/charlotte.weil" target="_blank"
                  >Charlotte Weil (IT4R)</a
                ><br />
                <a href="https://people.epfl.ch/antonin.mack" target="_blank"
                  >Antonin Mack (ALICE)</a
                ><br />
                <a
                  href="https://www.linkedin.com/in/valentin-moullet-a4a93566/"
                  target="_blank"
                  >Valentin Moullet (civiliste chez IT4R)</a
                >
              </p>
              <h2>Contact</h2>
              <p>
                N’hésitez-pas à nous contacter pour toute question ou remarque
                concernant le projet et pour nous faire part de vos idées !<br />
                Nous serons heureux.ses de vous répondre par email ou
                téléphone.<br />
                <a href="mailto:alice.news@epfl.ch">alice.news@epfl.ch</a><br />
                ALICE Administration / Jaime Ruiz /
                <a href="tel:+41216933203">+41 21 693 32 03</a>
              </p>
              <div class="d-flex">
                <a href="https://epfl.ch/" target="_blank">
                  <v-img
                    contain
                    src="/logo/EPFL_Logo_184X53.svg"
                    height="50px"
                    width="100px"
                  />
                </a>
                <a href="https://www.epfl.ch/labs/alice/" target="_blank">
                  <v-img
                    contain
                    src="/logo/alice.png"
                    height="50px"
                    width="100px"
                  />
                </a>
                <a href="https://www.epfl.ch/labs/lasig/" target="_blank">
                  <v-img
                    contain
                    src="/logo/lasig.png"
                    height="50px"
                    width="100px"
                  />
                </a>
              </div>
            </template>
          </simple-dialog>
          <v-divider vertical />
          <simple-dialog class="flex-even">
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" class="flex-even" text v-on="on">
                Tutoriel
              </v-btn>
            </template>
            <template #default>
              <h1>TUTORIEL _________________________________</h1>
              <br />
              <br />
              <h2>Chapitre 1_Cartographies affectives</h2>
              <br />
              <vimeo-player video-id="779612161" h="1b70e8ad36" />
              <br />
              <br />
              <h2>Chapitre 2_Atlas des paysages de mobilité</h2>
              <br />
              <vimeo-player video-id="779616745" h="90a6abd206" />
              <br />
              <br />
              <h2>Chapitre 2b_Analyses mobilité</h2>
              <br />
              <vimeo-player video-id="779617702" h="bfe20bd346" />
              <br />
            </template>
          </simple-dialog>
          <v-divider vertical />
          <simple-dialog class="flex-even">
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" class="flex-even btn-right" text v-on="on">
                A Propos
              </v-btn>
            </template>
            <template #default>
              <h1>A PROPOS _________________________________</h1>
              <br />
              <h2>Le projet</h2>
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
              <h2>Cartographies affectives</h2>
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
              <h2>Atlas des paysages de la mobilité</h2>
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
                L’Atlas inclut également un index de mobilité qui est issu d’une
                analyse spatiale d’éléments caractéristiques de l’espace urbain,
                de la mobilité piétonne et de l’environnement tels que la
                longueur du réseau piéton, la qualité des trottoirs, la densité
                de végétation, la distance aux espaces verts et aux berges du
                Rhône ou encore la mesure du bruit routier, entre autres.
              </p>
              <p>
                Enfin, l'Atlas inclut également quelques premières analyses du
                questionnaire participatif (MAPTIONNAIRE) venant de clore. Il
                visait à recueillir les pratiques de mobilité, les déplacements
                quotidiens et les attachements affectifs des habitant.e.s. Il a
                été réalisé sur la commune de Vernier entre février et juin
                2022. Une analyse plus approfondie du questionnaire sera
                réalisée par la suite.
              </p>
              <h2>Navigation sur le site</h2>
              <p>
                Les onglets sur la gauche sont extensibles et permettent
                d’entrer dans les couches pour comprendre les superpositions
                d’information. Il y a deux voire parfois trois niveaux de
                navigation possibles. Les onglets se referment facilement en
                cliquant à nouveau sur le triangle.<br />
                Les descriptifs et légendes en bas de page donnent des
                informations supplémentaires pour chaque carte ou chapitre.
                <br />
                L'icône carré en haut à droite permet de voir les cartes en
                pleine page.
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
              <p>
                Les chercheurs d'ALICE et de LASIG assument la responsabilité
                d'avoir les droits d'afficher publiquement les informations
                partagées sur ce site web.<br />
                Les chercheurs ont veillé à ce que les droits de tous les
                participant.e.s au projet soient respectés, en assurant
                l’anonymat complet des données.
              </p>
              <p>
                <a
                  href="https://www.epfl.ch/about/overview/fr/reglements-et-directives/mentions-legales/"
                  target="_blank"
                  >Mentions légales</a
                ><br />
                <a
                  href="https://go.epfl.ch/protection-des-donnees/"
                  target="_blank"
                  >Protection des données</a
                >
              </p>
            </template>
          </simple-dialog>
        </div>
      </div>
      <v-divider vertical />
      <div class="flex-grow-1 d-flex flex-column">
        <web-map
          ref="webMap"
          :center="center"
          :base-layers="baseLayers"
          :dems="dems"
          :items="mapItems"
          :min-zoom="minZoom"
          :max-zoom="maxZoom"
          :zoom.sync="zoom"
        />
        <v-divider />
        <div v-if="!fullscreen" class="d-flex flex-row">
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
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Attachement au lieu et étendue spatiale'
                    )
                  "
                >
                  <p>
                    L'attachement affectif au territoire qui nous entoure
                    soutient et définit notre vie quotidienne. Les activités,
                    les relations et les expériences y sont ancrées, de même que
                    notre capacité à nous relier aux expériences passées et à
                    nous projeter, individuellement et collectivement, dans
                    l'avenir. Il est également à l'origine de pratiques de
                    respect de l'environnement et soins sociétaux essentiels à
                    la transition écologique. Cependant, cette spatialité
                    affective est difficile à définir par une simple ligne. Où
                    commence et s’arrête l’espace du quotidien ? Et nos affects
                    ? Le sentiment d’attachement à un lieu s’exprime au travers
                    de la proximité usagère, affective ou symbolique aux objets
                    architecturaux, au patrimoine naturel, aux noms donnés aux
                    lieux ou aux pratiques sociales partagées.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Identité de la commune'
                    )
                  "
                >
                  <p>
                    Est-ce qu’il y a une identité verniolane ? Cette collection
                    révèle les identités multiples se déployant à Vernier, de
                    l’échelle communale (les éléments représentatifs d'une
                    identité propre à la commune, son paysage culturel et
                    symbolique) jusqu’à l'échelle des quartiers et des
                    expériences quotidiennes (les signes et repères importants
                    marquant certaines expériences partagées et parcours
                    habituels).
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Imaginaires et savoirs oraux'
                    )
                  "
                >
                  <p>
                    L’expérience d’un territoire passe par des canaux
                    immatériels qui se transmettent et se déplacent de corps à
                    corps à l’intérieur de la commune. Cette série s’articule
                    autour des récits collectifs, des interrogations et
                    spéculations individuelles collectés durant les entretiens.
                    La circulation de savoirs oraux et la construction d’un
                    imaginaire commun sont des moyens d’extraire les
                    connaissances d’un territoire vécu et de redonner la parole
                    aux savoirs locaux.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Expériences de mobilité'
                    )
                  "
                >
                  <p>
                    Les pratiques de mobilité peuvent être soit encouragées,
                    soit bloquées par l'environnement matériel et physiologique
                    dans lequel nous vivons. Expériences de mobilité se compose
                    de sept codes qui étudient les manières et raisons de se
                    déplacer, les paramètres influençant la qualité et fréquence
                    des déplacements ainsi que les itinéraires choisis ou évités
                    dans la mobilité douce.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Dimensions non visuelles'
                    )
                  "
                >
                  <p>
                    Nos cartes ont tendance à ne prendre en compte que l’aspect
                    visuel des choses, invisibilisant ainsi beaucoup d'autres
                    effets de l'environnement sur nos corps et nos affects..
                    Cette collection vise à mettre à la disposition de notre
                    perception plusieurs dimensions non visuelles comme le son
                    et l’olfaction, autant présentes et conditionnantes à la
                    réalité de l'environnement habité. Par exemple, certaines
                    citations décrivent l’attention accordée aux types de
                    végétaux, essences d’arbres, changements saisonniers, et
                    présence de multiples êtres vivants lors des parcours
                    quotidiens, appelant à appréhender le territoire à juste
                    titre comme un objet vivant et multisensoriel.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Mémoire et temporalités plurielles'
                    )
                  "
                >
                  <p>
                    Cette série explore la diversité des mémoires et
                    temporalités actives sur le territoire, celles qui
                    permettent de le reconnaître et de marquer son habitabilité.
                    Tout comme l’identité, la mémoire est à la fois collective
                    et individuelle. En plus, la mémoire active les moments
                    présents et l’entrelace avec les possibilités de l’avenir,
                    ainsi qu’avec les perceptions temporelles de nos voisins. On
                    explore ici également les rythmes et cycles quotidiens ou
                    saisonniers afin d’appréhender les variations des mobilités
                    et des pratiques situées.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Bien-être et perception des risques'
                    )
                  "
                >
                  <p>
                    Une nature diversifiée, culturellement riche et accessible
                    peut jouer un grand rôle sur le bien-être et la santé des
                    habitants et augmenter leur puissance d’agir. Où cela
                    dynamise t-'il d'aller dans la Commune ? Quels sont les
                    lieux qui ressourcent ? Où l'environnement contribue-t-il à
                    nous dissuader d'aller ?
                  </p>
                  <p>
                    En parallèle, la commune contient un imaginaire important
                    lié à divers risques présents et intégrés au quotidien des
                    habitants. La coexistence des personnes avec ces lieux
                    demande à trouver un potentiel équilibre à négocier et
                    adresser constamment. La perception des risques peut influer
                    sur le bien-être et la sérénité sur le long terme. Les
                    comprendre en détail en nous demandant comment ils affectent
                    les pratiques, la mobilité ou les relations sociales est
                    essentiel pour rendre le territoire non seulement habitable,
                    mais aussi accueillant.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith('atlas/Pratiques situées')
                  "
                >
                  <p>
                    Cette collection témoigne de la diversité des habitudes, des
                    rituels et des pratiques localisées et reliées au territoire
                    de la commune. Qu'elles soient de l’ordre du public, du
                    groupé ou de l’intime, les pratiques entraînent et
                    déterminent tout un réseau de parcours et de trajets
                    (loisirs, courses, rencontres, promenade…) ainsi que des
                    nœuds d’intensité ou au contraire de vides. La carte trace
                    des lieux du quotidien, révélant les zones d’occupations et
                    d’usage, les espaces communs entre les quartiers.
                  </p>
                </template>
                <template
                  v-if="lastSelectedLayerId.startsWith('atlas/Territorialité')"
                >
                  <p>
                    Qu'est-ce qui est ressenti comme le centre de la commune ?
                    Qu'est-ce qui fait limite, frontière ? Qu'est-ce qui est
                    perçu comme au-delà, inaccessible ou invisible dans la
                    commune ? La superposition des calques fait apparaître un
                    territoire centrifuge, à l’intérieur duquel s’agencent des
                    foyers de vie souvent reliés au dehors des limites
                    communales, avec le Rhône en plein cœur. Le territoire n’est
                    pas une entité abstraite et donnée. Le territoire est
                    construit dans la pratique, et c’est donc depuis celle-ci
                    que l' on peut le comprendre et le rendre visible.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith('atlas/Écologies politiques')
                  "
                >
                  <p>
                    Nos territoires ne sont pas un fait acquis, ce sont des
                    entités affectives et effectives construites collectivement
                    qui nous demandent chaque jour un effort de négociation.
                    Différents agents, responsabilités, besoins et savoirs
                    convergent pour établir un terrain d'échange où nous
                    déciderons comment nous voulons vivre ensemble. C'est là que
                    le conflit et le désir se rejoignent pour façonner l'avenir
                    de nos biens communs.
                  </p>
                </template>
              </template>
              <template v-if="selectedCategoryId === 'participative'">
                <h4>Description de la thématique</h4>
                <p>
                  Comprendre le sens du lieu et la manière dont les citoyens
                  sont affectés par leur environnement bâti joue un rôle crucial
                  pour aborder les questions socio-écologiques, les engagements
                  collectifs et parvenir à des villes plus humaines et plus
                  résilientes. Ce projet développera des méthodologies
                  transdisciplinaires pour rassembler, engager et transférer les
                  intelligences locales des communautés. Dans le but
                  d'intensifier la connexion entre la culture et le territoire,
                  un ensemble de besoins interdépendants entre les différents
                  acteurs de la commune de Vernier sera développé afin de
                  valoriser le territoire en tant que ressource partagée.
                </p>
                <p>
                  Le projet, en collaboration avec le service de la culture de
                  Vernier et la curatrice Hélène Mariéthoz, entend activer des
                  échanges transversaux entre les chercheurs, les travailleurs
                  qui façonnent le territoire de la commune, les habitants et
                  les artistes. Le territoire en tant qu'interface sera un
                  terrain de jeu pour aborder et explorer la notion
                  d'attachement à un lieu et de portée affective.
                </p>
              </template>
              <template v-if="selectedCategoryId === 'environment'" />
            </div>
          </div>
          <v-divider vertical />
          <div class="flex-even legend">
            <div class="ma-3">
              <template v-if="selectedCategoryId === 'mapping'">
                <h4>Légende</h4>
                <legend-item image-src="img/legends/voices.png">
                  <span class="font-weight-bold">Voix. </span>Recueille des
                  fragments de récits tout au long du parcours effectué, parlant
                  de lieux directement visibles, proches ou lointains qui
                  apparaissent dans la discussion.
                </legend-item>
                <legend-item image-src="img/legends/parcours.png">
                  <span class="font-weight-bold">Parcours. </span>L’itinéraire
                  de l’entretien effectué. La largeur fluctue selon la vitesse
                  de marche, la couleur selon la pente du parcours. Les
                  entretiens durent entre 50 minutes et 3 heures.
                </legend-item>
                <legend-item image-src="img/legends/constellation.png">
                  <span class="font-weight-bold">Constellation. </span
                  >Rassemblent une série de lieux significatifs pour chaque
                  récit, montrant l'étendue et la nature discontinue de notre
                  expérience vécue et les différents territoires que cela
                  dessine.
                </legend-item>
                <legend-item image-src="img/legends/horizons.png">
                  <span class="font-weight-bold">Horizons. </span>Succession de
                  points de vue visibles depuis l’itinéraire. Révèle la
                  profondeur de l’espace affecté par notre mobilité et l’étendue
                  variable du regard selon les lieux.
                </legend-item>
              </template>
              <template v-if="selectedCategoryId === 'participative'">
                <h4>Légende du cadre</h4>
                <legend-item image-src="img/legends/voices.png">
                  <span class="font-weight-bold">Voix. </span>Recueille des
                  fragments de récits tout au long du parcours effectué, parlant
                  de lieux directement visibles, proches ou lointains qui
                  apparaissent dans la discussion.
                </legend-item>
              </template>
              <template v-if="selectedCategoryId === 'atlas'">
                <h4>Légende du cadre</h4>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Attachement au lieu et étendue spatiale'
                    )
                  "
                >
                  <p>Carte des toponymes superposés</p>
                  <legend-item
                    image-src="img/legends/Atlas_01_A.png"
                    text="Nomenclature des noms locaux"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_01_B.png"
                    text="Lieux-dits datant de 1828, Plan Edmond Pictet "
                  />
                  <legend-item
                    image-src="img/legends/Atlas_01_C.png"
                    text="Offices postaux"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_01_D.png"
                    text="Cours d’eau"
                  />
                  <legend-source
                    text="Swisstopo / SITG / Livre Profil de Vernier, Pierre Pittard, 1975"
                  />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Identité de la commune'
                    )
                  "
                >
                  <p>Carte des toponymes superposés</p>
                  <legend-item
                    image-src="img/legends/Atlas_02_A.png"
                    text="Inventaire des objets principaux du patrimoine culturel et architectural"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_02_B.png"
                    text="Inventaire du patrimoine industriel"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_02_C.png"
                    text="Inventaire du patrimoine naturel"
                  />
                  <legend-source
                    text="SITG et les archives de la commune (coll. Ville de Vernier)."
                  />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Imaginaires et savoirs oraux'
                    )
                  "
                >
                  <legend-item
                    image-src="img/legends/Atlas_03_A.png"
                    text="Cette carte transpose la matière brute de fragments d’entretiens là où ils ont été évoqués."
                  />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Expériences de mobilité'
                    )
                  "
                >
                  <template
                    v-if="
                      lastSelectedLayerId.startsWith(
                        'atlas/Expériences de mobilité/Analyses/Accessibilité'
                      )
                    "
                  >
                    <p>Index de mobilité</p>
                    <p>
                      <span
                        v-for="item in lasiglegendItems"
                        :key="item.color"
                        style="display: block"
                      >
                        <color-box :color="item.color" />
                        {{ item.text }}
                      </span>
                    </p>
                    <p>
                      L’index de mobilité piétonne est issu d’une analyse
                      statistique spatiale. Il se sert de trente éléments qui
                      affairent à la mobilité piétonne pour permettre de
                      quantifier à quel point chaque morceau du territoire de la
                      commune de Vernier, lorsqu’il est scindé en une grille
                      hectométrique (100 x 100 mètres), se prête à la mobilité
                      douce.
                    </p>
                    <p>
                      Parmi les trente éléments ayant servi à l’élaboration de
                      l’index de mobilité, on retrouve, entre autres, des
                      caractéristiques de connectivité du réseau de circulation
                      piétonne et routière (longueur du réseau, densité, nombre
                      d’intersections etc…), le nombre de trottoirs, leur
                      longueur, ainsi que leurs discontinuités, des éléments
                      associés à l’environnement (densité de végétation, bruit
                      routier), et des distances à des lieux essentiels de la
                      circulation piétonne que sont les parcs publics ainsi que
                      les berges du Rhône.
                    </p>
                    <p>
                      L’analyse statistique de l’ensemble de ces éléments a
                      permis d’attribuer un score à chaque carré de la grille
                      divisant la commune de Vernier, allant de 0 (carré vert,
                      espace particulièrement favorable à la mobilité piétonne)
                      à 1 (carré rouge, espace totalement défavorable à la
                      mobilité piétonne).
                    </p>
                  </template>
                  <template
                    v-else-if="
                      lastSelectedLayerId.startsWith(
                        'atlas/Expériences de mobilité/Analyses/Facilitateurs'
                      )
                    "
                  >
                    <legend-item
                      image-src="img/legends/Atlas_04_Facilitateurs_A.png"
                    >
                      Un facilitateur est une caractéristique environnementale,
                      naturelle ou humaine, qui encourage ou aide les pratiques
                      de mobilité active.
                    </legend-item>
                    <p>
                      Le heat map des "facilitateurs" est issu des réponses
                      fournies par les Verniolans à un questionnaire
                      participatif, lors duquel il leur a été demandé de placer
                      sur une carte des aménagements qui facilitent ou
                      encouragent la mobilité douce. En zoomant sur la carte, on
                      distingue des nuages de points plus ou moins grands, selon
                      que les réponses ont été placées aux mêmes endroits par
                      plusieurs répondants.
                    </p>
                    <p>
                      En survolant les points au moyen de la souris, il est
                      possible d'obtenir plus de précisions sur la nature de
                      l'aménagement, et en quoi celui-ci permet d'améliorer la
                      mobilité douce.
                    </p>
                    <legend-source
                      text="Maptionnaire en ligne, plus d'informations dans A PROPOS"
                    />
                  </template>
                  <template
                    v-else-if="
                      lastSelectedLayerId.startsWith(
                        'atlas/Expériences de mobilité/Analyses/Obstacles'
                      )
                    "
                  >
                    <legend-item
                      image-src="img/legends/Atlas_04_Obstacles_A.png"
                    >
                      Un obstacle est une caractéristique environnementale,
                      naturelle ou humaine, qui encourage ou aide les pratiques
                      de mobilité active.
                    </legend-item>
                    <p>
                      Le heat map des "obstacles" est issu des réponses fournies
                      par les Verniolans à un questionnaire participatif, lors
                      duquel il leur a été demandé de placer sur une carte des
                      aménagements qui découragent voire bloquent la mobilité
                      douce. En zoomant sur la carte, on distingue des nuages de
                      points plus ou moins grands, selon que les réponses ont
                      été placées aux mêmes endroits par plusieurs répondants.
                    </p>
                    <p>
                      En survolant les points au moyen de la souris, il est
                      possible d'obtenir plus de précisions sur la nature de
                      l'aménagement, et en quoi celui-ci réduit la qualité de la
                      mobilité douce.
                    </p>
                    <legend-source
                      text="Maptionnaire en ligne, plus d'informations dans A PROPOS"
                    />
                  </template>
                  <template v-else>
                    <legend-item
                      image-src="img/legends/Atlas_04_A.png"
                      text="réseau piéton de la commune de Vernier"
                    />
                    <legend-item
                      image-src="img/legends/Atlas_04_B.png"
                      text="dessin de la signalétique piétonne au sol révélant les relations et conflits entre les différents moyens de transport et les continuités/discontinuités lors des déplacements."
                    />
                    <legend-source text="Openstreemap / SITG" />
                  </template>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Dimensions non visuelles'
                    )
                  "
                >
                  <legend-item
                    image-src="img/legends/Atlas_05_A.png"
                    text="Bruit : Extraction du bruit routier mesuré aux façades des bâtiments"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_05_B.png"
                    text="Bruit de l'aéroport (surface définie à l'intérieur des courbes enveloppantes du degré de sensibilité OPB II) / Bruit voies ferroviaires"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_05_C.png"
                    text="Olfaction : sources d’odeurs venant des parfums des industries locales"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_05_D.png"
                    text="Olfaction : sources d’odeurs de kérosène"
                  />
                  <legend-source
                    text="SITG / Enquête sur les nuisances olfactives à Vernier en 1983, par le service cantonal d'écotoxicologie"
                  />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Mémoire et temporalités plurielles'
                    )
                  "
                >
                  <legend-item
                    image-src="img/legends/Atlas_06_A.png"
                    text="Carte historique Siegfried datant de 1899"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_06_B.png"
                    text="Carte des Inventaire des voies de communication historiques de la Suisse (IVS) "
                  />
                  <legend-source text="SITG / Swisstopo" />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'atlas/Bien-être et perception des risques'
                    )
                  "
                >
                  <legend-item
                    image-src="img/legends/Atlas_07_A.png"
                    text="Recensement des espaces verts et sportifs de la commune"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_07_B.png"
                    text="Recensement des espaces naturels de la commune"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_07_C.png"
                    text="Risques : Sites industriels (en particulier citernes et sites chimiques), SIG et différentes conduites"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_07_D.png"
                    text="Risques : trafic routier et pollution sur les grands axes, train et transport de chlore"
                  />
                  <legend-source text="SITG" />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith('atlas/Pratiques situées')
                  "
                >
                  <p>Equipements publics :</p>
                  <legend-item
                    image-src="img/legends/Atlas_08_A.png"
                    text="administration"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_08_B.png"
                    text="culture"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_08_C.png"
                    text="enseignement"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_08_D.png"
                    text="santé-social"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_08_E.png"
                    text="sécurité"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_08_F.png"
                    text="sport et loisirs"
                  />
                  <legend-source text="SITG" />
                </template>
                <template
                  v-if="lastSelectedLayerId.startsWith('atlas/Territorialité')"
                >
                  <legend-item
                    image-src="img/legends/Atlas_09_A.png"
                    text="Topographie"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_09_B.png"
                    text="Perceptions multiples et diffuses des frontières de la commune"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_09_C.png"
                    text="Barrières linéaires sur le territoire communal (routes et voies ferrées)"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_09_D.png"
                    text="Quai gare"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_09_E.png"
                    text="Arrêt TPG"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_09_F.png"
                    text="Débarcadère"
                  />
                  <legend-source
                    text="SITG et entretiens réalisés sur la commune"
                  />
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith('atlas/Écologies politiques')
                  "
                >
                  <legend-item
                    image-src="img/legends/Atlas_10_A.png"
                    text="Equipements publics"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_10_B.png"
                    text="Dépendances"
                  />
                  <legend-item
                    image-src="img/legends/Atlas_10_C.png"
                    text="Propriétés publiques (CFF, CIA, SIG…)"
                  />
                  <legend-source text="SITG" />
                </template>
              </template>
              <template v-if="selectedCategoryId === 'environment'">
                <h4>Description</h4>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'environment/Fond de carte ALICE'
                    )
                  "
                >
                  <p>
                    Pour différentes études sur le territoire genevois, le
                    laboratoire ALICE développe depuis plusieurs années des
                    outils et techniques de dessin transcalaire à partir du
                    Modèle Numérique de Surface (MNS) disponible auprès du
                    guichet cartographique genevois (SITG). Le traitement et
                    l'intégration de ces données permet une vision inédite du
                    territoire.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'environment/Carte Nationale'
                    )
                  "
                >
                  <p>
                    La carte nationale au 1:25’000 est la carte topographique
                    suisse avec une représentation très détaillée des voies de
                    communications, des surfaces bâties, de l’hydrographie, du
                    terrain et de la végétation. La carte nationale au 1:25’000
                    est disponible sous forme analogique (carte papier) et
                    numérique (Swiss Map Raster) auprès de l’Office fédéral de
                    topographie (Swisstopo).
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith('environment/Photo aérienne')
                  "
                >
                  <p>
                    La mosaïque d'orthophotos SWISSIMAGE 10 cm est un assemblage
                    des nouvelles images aériennes numériques en couleurs sur
                    l'ensemble de la Suisse avec une résolution au sol de 10 cm
                    dans les régions de plaine et les principales vallées
                    alpines et de 25 cm dans les Alpes. Elle est mise à jour
                    selon un cycle de 3 ans.
                  </p>
                </template>
                <template
                  v-if="
                    lastSelectedLayerId.startsWith(
                      'environment/Grille kilométrique'
                    )
                  "
                >
                  <p>
                    Sur les cartes Swisstopo, les coordonnées nationales suisses
                    sont indiquées sous forme d'un réseau de lignes
                    perpendiculaires entre elles (le quadrillage). Aux échelles
                    1:25’000 et 1:50’000, il s'agit d'une grille à 1 km avec un
                    maillage de 4 cm, respectivement 2 cm comportant un axe
                    ouest-est et un axe sud-nord. Cette grille orthogonale
                    métrée est une projection cartographique particulière du
                    globe terrestre adaptée au territoire suisse, elle ne
                    correspond donc pas aux valeurs angulaires de latitude et
                    longitude.
                  </p>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <simple-dialog button-text="Commencer" open>
      <h1>Bienvenue sur alicelandings ! __________________</h1>
      <br />
      <p>
        Cette plateforme vous permettra de visualiser les cartographies
        développées par les laboratoires ALICE et LASIG de l'EPFL, qui ont
        étudié en 2021-2022 les potentialités du paysage urbain pour promouvoir
        les pratiques de mobilité douce et le bien-être des habitants de
        Vernier. La recherche s’est construite au travers d’entretiens en
        marchant avec des habitants de la commune et d’un questionnaire en
        ligne.
      </p>
      <h2>C’est quoi ?</h2>
      <p>
        Vous verrez différentes cartes qui explorent le lien entre les espaces
        construits de la commune et les usages des habitants à travers des
        récits collectés. La plateforme est divisée en plusieurs chapitres :
      </p>
      <ul>
        <li>
          Le chapitre
          <v-tooltip bottom max-width="512">
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                class="d-inline-flex font-weight-bold"
                v-on="on"
              >
                Cartographies affectives&nbsp;
                <v-icon color="primary" small> mdi-information-outline </v-icon>
              </span>
            </template>
            <p class="text-justify">
              Ce chapitre représente l’espace urbain vécu dans Vernier à travers
              quinze entretiens réalisés avec des habitant.e.s nous guidant à
              travers la commune. Ces cartes tentent de dessiner les engagements
              affectifs des citoyens avec leur environnement quotidien (lieux
              pratiqués et parcourus par l'habitant et générant un archipel de
              lieux significatifs).
            </p>
            <p class="purple--text">
              À explorer et superposer sans modération !
            </p>
          </v-tooltip>
        </li>
        <li>
          Le chapitre
          <v-tooltip bottom max-width="512">
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                class="d-inline-flex font-weight-bold"
                v-on="on"
              >
                Atlas des paysages de mobilité&nbsp;
                <v-icon color="primary" small> mdi-information-outline </v-icon>
              </span>
            </template>
            <p class="text-justify">
              Ce chapitre rassemble par thématiques les témoignages des
              Verniolans, décrivant des expériences faites en se déplaçant à
              pied ou à vélo dans la commune de Vernier et alentours. L'Atlas
              inclut également quelques premiers résultats tirés du
              questionnaire en ligne et un index de marchabilité relatif à
              l'accessibilité piétonne.
            </p>
            <p class="purple--text">
              Soyez attentifs aux cercles, ils ont des choses à dire…
            </p>
          </v-tooltip>
        </li>
        <li>
          Le chapitre
          <v-tooltip bottom max-width="512">
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                class="d-inline-flex font-weight-bold"
                v-on="on"
              >
                Cartographie participative&nbsp;
                <v-icon color="primary" small> mdi-information-outline </v-icon>
              </span>
            </template>
            <p class="text-justify">
              Ce chapitre contient des cartes “maptionnaire” permettant
              d’afficher les résultats de notre enquête participative.
            </p>
          </v-tooltip>
        </li>
        <li>
          Le chapitre
          <v-tooltip bottom max-width="512">
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                class="d-inline-flex font-weight-bold"
                v-on="on"
              >
                Contexte et fonds de cartes&nbsp;
                <v-icon color="primary" small> mdi-information-outline </v-icon>
              </span>
            </template>
            <p class="text-justify">
              Ce chapitre contient des cartes plus classiques pour permettre de
              se repérer facilement.
            </p>
          </v-tooltip>
        </li>
      </ul>
      <br />
      <h2>Navigation sur le site</h2>
      <p class="font-weight-bold">
        En passant avec le curseur sur les croix/cercles vous verrez apparaître
        les citations des habitant.e.s.
      </p>
      <p>
        Les onglets sur la gauche sont extensibles et permettent d’afficher et
        de superposer différentes couches d’informations. Vous pouvez avoir plus
        d’informations sur l’onglet À PROPOS et des mini tutoriels sur l’onglet
        TUTO.
        <span class="font-weight-bold"
          >On vous conseille d’accéder au site sur un ordinateur car celui-ci
          n'a pas été optimisé sur téléphone.</span
        >
      </p>
      <h2>Pourquoi ?</h2>
      <p>
        Pour rendre les villes plus résilientes et durables face aux défis posés
        par le changement climatique dans nos villes, il est essentiel de
        comprendre le rôle que joue l'environnement construit dans la vie
        quotidienne de leurs habitants et de disposer de cartes capables
        d'aborder les engagements affectifs, les imaginaires et les mémoires
        collectives.
      </p>
      <h2>Bonne découverte !</h2>
    </simple-dialog>
  </div>
</template>

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

  // fix legend overflow issues on mobile TODO better solution
  h4,
  p,
  span,
  div {
    overflow-wrap: anywhere;
  }
}
</style>
