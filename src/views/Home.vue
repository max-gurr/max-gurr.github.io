<template>
  <div class="home page">
    <component v-bind:is="selectedBackground" />
    <h1>Welcome</h1>
    <backgroundSelect :backgrounds="backgroundComponents" @click="setBackground"></backgroundSelect>
  </div>
</template>

<script>
// @ is an alias to /src
import particles from '@/components/particles';
import fallingSquares from '@/components/falling-squares.vue';
import backgroundSelect from '@/components/background/select.vue';

export default {
  name: 'Home',
  components: {
    particles,
    fallingSquares,
    backgroundSelect
  },
  data: () => ({
    selectedBackground: null,
    backgroundComponents: [
      {
        display: 'P',
        value: 'particles'
      }, 
      {
        display: 'S',
        value: 'falling-squares'
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

  h1 {
    font-size: 5em;
    color: rgba(49, 91, 189, 0.8);
  }

  .bg-btn {
    padding: 10px;
    border: solid 2px white;
    margin: 10px;
    color: white;
    font-size: 1.5em;
    background-color: rgba(255, 255, 255, 0.2);
    outline: none;

    &:active {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>