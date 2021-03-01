<template>
  <div class="home page">
    <component v-bind:is="backgroundComponent" />
    <h1>Welcome</h1>
    <div class="flex-row">
      <button class="bg-btn" v-on:click="setBackground('particles')">particles</button>
      <button class="bg-btn" v-on:click="setBackground('falling-squares')">squares</button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import particles from '@/components/particles';
import fallingSquares from '../components/falling-squares.vue';

export default {
  name: 'Home',
  components: {
    particles,
    fallingSquares
  },
  data: () => ({
    backgroundComponent: 'particles'
  }),
  methods: {
    setBackground(background) {
      this.backgroundComponent = background;
    }
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

    .flex-row {
      display: flex;
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