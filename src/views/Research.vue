<template>
    <Transition name="content-fade" mode="out-in" appear>
    <div class="page">
        <SiteNav title="Research"/>
        <ResearchContent key="research"/>
    </div>
  </Transition>
</template>

<script>
import ResearchContent from '@/components/ResearchContent.vue';
import SiteNav from '@/components/SiteNav.vue';

export default {
  name: 'research-page',
  components: {
    ResearchContent,
    SiteNav
  }
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;

</style>