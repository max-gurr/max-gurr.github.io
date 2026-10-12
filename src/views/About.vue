<template>
  <div class=" page">
    <AboutContent/>
  </div>
</template>

<script>
import AboutContent from '@/components/AboutContent.vue';

export default {
  name: 'about-page',
  components: {
    AboutContent
  }
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;

</style>