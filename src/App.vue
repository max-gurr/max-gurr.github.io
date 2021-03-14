<template>
  <div id="app">
    <NavBar />
    <router-view/>
  </div>
</template>

<script>
import NavBar from '@/components/global/nav-bar.vue';

export default {
  name: "App",
  components: {
    NavBar
  }
};
</script>

<style lang="scss">
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 16px;
}

.page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
}

.canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
