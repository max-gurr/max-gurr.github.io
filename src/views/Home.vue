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
import connectedParticles from '@/components/background/connected-particles.vue';
import pixelRain from '@/components/background/pixel-rain.vue';
import rippleGrid from '@/components/background/ripple-grid.vue';

export default {
  name: 'Home',
  components: {
    connectedParticles,
    pixelRain,
    backgroundSelect,
    rippleGrid
  },
  data: () => ({
    selectedBackground: null,
    backgroundComponents: [
      {
        display: 'P',
        value: 'connected-particles'
      }, 
      {
        display: 'R',
        value: 'pixel-rain'
      },
      {
        display: 'G',
        value: 'ripple-grid'
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

    @media (max-width: 720px) {
      width: calc(100% - 85px);
      height: calc(100% - 85px);
    }

    &:hover, &:active {
      background-color: rgba(0, 0, 0, 0.2);
      transition: all 0.5s ease;
      transition-delay: 0.4s;
    }

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

    &:hover::before, &:hover::after, &:active::before, &:active::after, &:focus::before, &:focus::after {
      height: 100%;
      width: 100%;
      transition-delay: 0s;
    }

    h1 {
      font-size: calc(min(5em, 10vw));
      color: rgb(49, 91, 189);
    }
  }
}
</style>