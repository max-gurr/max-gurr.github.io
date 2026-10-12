<template>
  <div class="page">
    <ResearchContent key="research"/>
  </div>
</template>

<script>
import ResearchContent from '@/components/ResearchContent.vue';

export default {
  name: 'research-page',
  components: {
    ResearchContent
  }
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;

</style>