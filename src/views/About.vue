<template>        
    <Transition name="content-fade" mode="out-in" appear>
        <div class="page">                
            <SiteNav title="About Me"/>
            <AboutContent/>
        </div>                
    </Transition>   
</template>

<script>
import AboutContent from '@/components/AboutContent.vue';
import SiteNav from '@/components/SiteNav.vue';

export default {
  name: 'about-page',
  components: {
    AboutContent,
    SiteNav
  }
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;

</style>