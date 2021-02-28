<template>
  <div class="home page">
    <particles></particles>
    <h1>Welcome</h1>
  </div>
</template>

<script>
// @ is an alias to /src
import particles from '@/components/particles'

export default {
  name: 'Home',
  components: {
    particles
  }
}
</script>

<style lang="scss">
  .home {
    align-items: center;
    justify-content: center;

    h1 {
      font-size: 5em;
      color: rgba(49, 91, 189, 0.8);
    }
  }
</style>