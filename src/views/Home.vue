<template>
  <div class="home page">
    <div class="container flex-center">
      <h1>Max Gurr</h1>
      <h2>full stack web dev</h2>
    </div>
    <component v-bind:is="selectedBackground" />
    <backgroundSelect :backgrounds="backgroundComponents" @click="setBackground"></backgroundSelect>
  </div>
</template>

<script>
import backgroundSelect from '@/components/background/select.vue';
// Backgrounds:
import constellations from '@/components/background/constellations.vue';
import pixelRain from '@/components/background/pixel-rain.vue';
import ripples from '@/components/background/ripples.vue';
import followers from '@/components/background/followers.vue';
import fish from '@/components/background/fish.vue';
import reflections from '@/components/background/reflections.vue';

export default {
  name: 'Home',
  components: {
    backgroundSelect,
    constellations,
    pixelRain,
    ripples,
    followers,
    fish,
    reflections
  },
  data: () => ({
    selectedBackground: null,
    backgroundComponents: [ 
      {
        value: 'reflections',
        icon: 'reflectionsIcon'
      },
      {
        value: 'followers',
        icon: 'followersIcon'
      },
      {
        value: 'fish',
        icon: 'fishIcon'
      },
      {
        value: 'constellations',
        icon: 'constellationsIcon'
      }
    ]
  }),
  methods: {
    setBackground(background) {
      this.selectedBackground = background;
    }
  },
  mounted() {
    this.selectedBackground = this.backgroundComponents[0].value;
  }
}
</script>

<style lang="scss">
.home {
  align-items: center;
  justify-content: center;

  .container {
    flex-direction: column;
    position: relative;
    transition: all 0.5s ease;
    transition-delay: 0s;
    border-top-right-radius: 1vw;
    border-bottom-left-radius: 1vw;
    border-bottom-right-radius: 0.5vw;
    border-top-left-radius: 0.5vw;
    padding: 15vh 15vw;
    max-width: 100vw;

    // &:hover, &:active {
    //   background-color: rgba(39, 39, 39, 0.5);
    //   transition: all 0.25s ease;
    //   transition-delay: 0.4s;
    // }

    $weight: 5px;
    &::before, &::after {
      content: "";
      background-color: rgba(255, 255, 255, 0.35);
      position: absolute;
      height: 20%;
      width: 20%;
      clip-path: polygon(-50% -50%, 150% -50%, 100% 0, 100% $weight, $weight $weight, $weight 100%, 0 100%, -50% 150%);
      transition: all 0.75s ease;
      transition-delay: 0.1s;
      box-shadow: 0px 0px 10px 2px rgba(255, 255, 255, 0.5);
    }
    &::before {
      top: 0;
      left: 0;
    }
    &::after {
      bottom: 0;
      right: 0;
      transform: rotate(180deg);
    }

    // &:hover::before, &:hover::after, &:active::before, &:active::after, &:focus::before, &:focus::after {
    //   height: 100%;
    //   width: 100%;
    //   transition-delay: 0s;
    //   margin: -2vw;
    // }

    h1 {
      font-size: calc(min(5em, 12vw));
      color: #29bd7f;
      font-variant: small-caps;
    }
    h2 {
      font-size: calc(min(2em, 5vw));
      color: #29bd7f;
      font-variant: small-caps;
    }
  }
}
</style>