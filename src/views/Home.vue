<template>
  <div class="home page">
    <div class="container flex-center">
      <h1>Welcome</h1>
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

export default {
  name: 'Home',
  components: {
    backgroundSelect,
    constellations,
    pixelRain,
    ripples,
    followers,
    fish
  },
  data: () => ({
    selectedBackground: null,
    backgroundComponents: [
      {
        value: 'constellations',
        icon: 'constellationsIcon'
      }, 
      {
        value: 'pixel-rain',
        icon: 'constellationsIcon'
      },
      {
        value: 'followers',
        icon: 'followersIcon'
      },
      {
        value: 'fish',
        icon: 'fishIcon'
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
  flex-direction: column;

  .container {
    position: relative;
    width: calc(100% - 150px);
    height: calc(100% - 150px);
    transition: all 0.5s ease;
    transition-delay: 0s;
    // border-top-right-radius: 25%;
    // border-bottom-left-radius: 25%;

    @media (max-width: 720px) {
      width: calc(100% - 85px);
      height: calc(100% - 85px);
    }

    // &:hover, &:active {
    //   background-color: rgba(79, 161, 141, 0.2);
    //   transition: all 0.5s ease;
    //   transition-delay: 0.4s;
    // }

    $weight: 5px;
    &::before {
      content: "";
      background-color: white;
      position: absolute;
      top: 0;
      left: 0;
      height: 15%;
      width: 15%;
      clip-path: polygon(-50% -50%, 150% -50%, 100% 0, 100% $weight, $weight $weight, $weight 100%, 0 100%, -50% 150%);
      transition: all 0.75s ease;
      transition-delay: 0.1s;
      box-shadow: 0px 0px 10px 2px rgba(255, 255, 255, 0.5);
    }

    &::after {
      content: "";
      background-color: white;
      position: absolute;
      bottom: 0;
      right: 0;
      height: 15%;
      width: 15%;
      clip-path: polygon(-50% -50%, 150% -50%, 100% 0, 100% $weight, $weight $weight, $weight 100%, 0 100%, -50% 150%);
      transform: rotate(180deg);
      transition: all 0.75s ease;
      transition-delay: 0.1s;
      box-shadow: 0px 0px 10px 2px rgba(255, 255, 255, 0.5);
    }

    // &:hover::before, &:hover::after, &:active::before, &:active::after, &:focus::before, &:focus::after {
    //   height: 100%;
    //   width: 100%;
    //   transition-delay: 0s;
    // }

    h1 {
      font-size: calc(min(5em, 10vw));
      color: #29bd7f;
    }
  }
}
</style>