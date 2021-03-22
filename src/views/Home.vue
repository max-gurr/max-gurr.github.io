<template>
  <div class="home page">
    <div class="home-container flex-center">
      <h1>Max Gurr</h1>
      <h2>software developer</h2>
      <div class="home-link flex-center" id="cv-link">
        <span>C.V.</span>
      </div>
      <div class="home-link flex-center" id="about-link">
        <span>About</span>
      </div>
    </div>
    <component v-bind:is="selectedBackground" />
    <backgroundSelect :backgrounds="backgroundComponents" @click="setBackground"></backgroundSelect>
  </div>
</template>

<script>
import backgroundSelect from '@/components/background/select.vue';
// Backgrounds:
import constellations from '@/components/background/constellations.vue';
import followers from '@/components/background/followers.vue';
import fish from '@/components/background/fish.vue';
import reflections from '@/components/background/reflections.vue';
import bamboo from '@/components/background/bamboo.vue';

export default {
  name: 'Home',
  components: {
    backgroundSelect,
    constellations,
    followers,
    fish,
    reflections,
    bamboo
  },
  data: () => ({
    selectedBackground: null,
    backgroundComponents: [ 
      {
        value: 'reflections',
        icon: 'reflectionsIcon'
      },
      {
        value: 'fish',
        icon: 'fishIcon'
      },
      {
        value: 'bamboo',
        icon: 'bambooIcon'
      },
      {
        value: 'followers',
        icon: 'followersIcon'
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
@import '../assets/variables.scss';

.home {
  align-items: center;
  justify-content: center;

  &-container {
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
    height: 50%;

    &::before, &::after {
      content: "";
      background-color: $white;
      position: absolute;
      height: calc(max(100px, 10vw));
      width: calc(max(100px, 10vw));
      clip-path: polygon(-50% -50%, 150% -50%, 100% 0, 100% 5px, 5px 5px, 5px 100%, 0 100%, -50% 150%);
      transition: all 0.75s ease;
      transition-delay: 0.1s;
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

  &-link {
    position: absolute;
    color: #2c3e50;
    font-size: calc(max(1em, 1.5vw));
    height: calc(max(80px, 8vw));
    width: calc(max(80px, 8vw));
    overflow: hidden;
    z-index: 9;
    font-weight: bold;
    text-transform: uppercase;
    transition: all 0.25s ease;

    &::before {
      content: "";
      position: absolute;
      min-width: 200%;
      min-height: 200%;
      border-radius: 50%;
      background-color: $white;
      opacity: 0.7;
      z-index: -1;
      transition: all 0.25s ease;
    }
    &:hover {
      transform: scale(1.1);
    }
    &:active {
      &::before {
        color: #192836;
        opacity: 1;
        transition: none;
      }
    }
  }
  #cv-link {
    transform-origin: 0 0;
    top: 5px;
    left: 5px;
    &::before {
      bottom: 0;
      right: 0;
    }
    span {
      margin: 0 10% 10% 0;
    }
  }
  #about-link {
    transform-origin: 100% 100%;
    bottom: 5px;
    right: 5px;
    &::before {
      top: 0;
      left: 0;
    }
    span { 
      margin: 15% 0 0 10%;
    }
  }
}
</style>