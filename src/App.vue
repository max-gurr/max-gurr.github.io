<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="scss">
@use './assets/variables.scss' as *;

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

.content-page {
  padding: 6rem 1.5rem 2rem;
  background: radial-gradient(circle at center, #022c38 0%, #000014 75%);

  &--embedded {
    background: transparent;
  }

  &__panel {
    width: min(100%, 48rem);
    padding: clamp(2rem, 6vw, 4rem);
    border: 1px solid rgba(239, 239, 239, 0.12);
    border-radius: 1.5rem;
    background: rgba(0, 0, 20, 0.5);
    color: $light-grey;
    text-align: left;
    backdrop-filter: blur(8px);
  }

  h1 {
    margin: 0 0 1rem;
    font-size: clamp(2.5rem, 7vw, 4rem);
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    color: rgba($light-grey, 0.82);
    font-size: clamp(1rem, 2vw, 1.125rem);
    line-height: 1.7;
  }

  &__back {
    display: inline-flex;
    margin-top: 2rem;
    padding: 0;
    border: 0;
    color: rgba($light-grey, 0.82);
    background: none;
    font: inherit;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid #20cc84;
      outline-offset: 4px;
    }
  }
}
</style>
