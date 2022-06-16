<template>
  <v-container>
    <h1>Le projet Plhebicite</h1>
    <p>
      Ce projet, fruit d'une collaboration entre ALICE (Atelier de la Conception
      de l'Espace) et LASIG (Laboratoire des Systèmes d'Information
      Géographique), aborde le changement climatique sous l'angle de
      l'infrastructure paysagère en tant que solution basée sur la nature
      capable de relier la connectivité urbaine, la mobilité active et la santé
      et le bien-être psychophysiques. Le paysage urbain joue un rôle
      infrastructurel clé, en soutenant et en rendant possibles différentes
      pratiques et comportements, et peut donc être instrumentalisé pour aborder
      l'interrelation complexe entre espace, mobilité et santé dans la ville
      contemporaine. Ce rôle est étudié en combinant l'approche de LASIG sur les
      systèmes d'information géographique et la modélisation territoriale avec
      l'approche sensible d'ALICE sur l'espace urbain, l'infrastructure
      paysagère et les pratiques de mobilité, et appliqué à la commune de
      Vernier (GE).
      <a
        href="https://www.epfl.ch/schools/enac/les-defis-du-developpement-durable/clusters-fr/enac-interdisciplinary-cluster-grants-fr/enac-cluster-grants-selected-projects-2020/planning-for-healthier-and-biodiverse-cities-%e2%80%a8linking-neighbourhoods-through-active-mobility-and-landscape-infrastructure/"
        target="_blank"
      >
        Link
      </a>
    </p>
    <h1>Partenaires</h1>
    <p>
      Commune de Vernier<br />
      Canton de Genève <br />
      Hélène Mariéthoz<br />
      <a
        href="https://www.epfl.ch/schools/enac/about/data-at-enac/enac-it4research/"
        target="_blank"
      >
        IT4R
      </a>
    </p>
    <h1>Remerciements</h1>
    <p>
      Nous remercions les nombreuses personnes qui nous ont aidé dans la
      recherche et qui ont participé au projet. En particuliers les habitant.e.s
      nous ayant guidé à travers la commune durant les entretiens en marchant.
      Nous remercions également le service de la cohésion sociale, les contrats
      de quartiers, les personnes rencontrées dans des associations ou dans les
      différents quartiers, le service de la culture et communication, le
      service de l’aménagement.
    </p>
    <h1>Equipe</h1>
    <p>
      Lucía Jalón Oyarzun (ALICE)<br />
      Marco Vieira Ruas (LASIG)<br />
      Emmanuelle Agustoni (ALICE)<br />
      Aurèle Pulfer (ALICE)
    </p>
    <h1>Contact</h1>
    <p>
      N’hésitez-pas à nous contacter pour toute question ou remarque concernant
      le projet et pour nous faire part de vos idées !
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
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapMutations } from "vuex";

@Component({
  methods: {
    ...mapMutations(["openAppBar"]),
  },
})
export default class About extends Vue {
  openAppBar!: () => void;

  created(): void {
    this.openAppBar();
  }
}
</script>
