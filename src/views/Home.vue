<template>
  <div class="home page">
    <div class="home-content-stage">
      <Transition name="content-fade" mode="out-in">
        <div v-if="activeContent === 'home'" key="home" class="home-container flex-center">
          <div class="home-identity">
            <h1>Max Gurr</h1>
          </div>
          <nav class="home-actions" aria-label="Portfolio pages">
            <button class="home-action" type="button" @click="showContent('about')">About me</button>
            <button class="home-action home-action--primary" type="button" @click="showContent('cv')">Research</button>
            <router-link class="home-action" to="/projects">Projects</router-link>
          </nav>
          <a class="home-email" href="mailto:maxd.gurr@gmail.com">maxd.gurr@gmail.com</a>
        </div>
        <main v-else-if="activeContent === 'cv'" key="cv" class="content-page page flex-center content-page--embedded">
          <section class="content-page__panel" aria-labelledby="cv-title">
            <h1 id="cv-title">CV</h1>
            <p>Curriculum vitae content coming soon.</p>
            <button class="content-page__back" type="button" @click="showHome">Back to home</button>
          </section>
        </main>
        <main v-else key="about" class="content-page page flex-center content-page--embedded">
          <section class="content-page__panel" aria-labelledby="about-title">
            <h1 id="about-title">About</h1>
            <p>This is an about page.</p>
            <button class="content-page__back" type="button" @click="showHome">Back to home</button>
          </section>
        </main>
      </Transition>
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
  name: 'home-page',
  components: {
    backgroundSelect,
    constellations,
    followers,
    fish,
    reflections,
    bamboo
  },
  data: () => ({
    activeContent: 'home',
    selectedBackground: null,
    backgroundComponents: [ 
      {
        value: 'fish',
        icon: 'fishIcon'
      },
      {
        value: 'reflections',
        icon: 'reflectionsIcon'
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
    showContent(content) {
      this.activeContent = content;
    },
    showHome() {
      this.activeContent = 'home';
    },
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
@use '../assets/variables.scss' as *;

.home {
  align-items: center;
  justify-content: center;

  &-content-stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-container {
    flex-direction: column;
    position: relative;
    gap: clamp(1.5rem, 4vw, 2rem);
    padding: clamp(2rem, 7vw, 5rem);
    padding-bottom: 2rem;
    max-width: calc(100vw - 2rem);
    border: 1px solid rgba(239, 239, 239, 0.12);
    border-radius: 1.5rem;
    background: rgba(0, 0, 20, 0.35);
    box-shadow: 0 1.5rem 5rem rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(14px);

    .home-identity {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(3.25rem, 10vw, 7rem);
      color: $light-grey;
      font-weight: 700;
      font-variant: small-caps;
      letter-spacing: 0.03em;
      line-height: 1;
      mix-blend-mode: difference;
    }
  }

  &-email {
    color: $soft-blue;
    font-size: clamp(0.875rem, 2vw, 1.125rem);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid $soft-blue;
      outline-offset: 4px;
    }
  }

  .content-fade-enter-active,
  .content-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .content-fade-enter-from,
  .content-fade-leave-to {
    opacity: 0;
  }

  &-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 3vw;
  }

  &-action {
    display: inline-flex;
    min-height: 3rem;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba($soft-blue, 0.7);
    border-radius: 999px;
    background: transparent;
    color: $light-grey;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: $soft-blue;
      background: rgba($light-grey, 0.1);
    }

    &:focus-visible {
      outline: 3px solid $soft-blue;
      outline-offset: 4px;
    }

    &--primary {
      border-color: $soft-blue;
      background: $light-grey;
      color: $bg-dark-blue;

      &:hover {
        border-color: $soft-blue;
        background: color-mix(in srgb, $light-grey 90%, white);
      }
    }
  }
}

@media (max-width: 480px) {
  .home {
    &-container {
      gap: 1.75rem;
      padding: 2rem 1.25rem 0.75rem;
    }

    &-actions {
      width: 100%;
      flex-direction: column;
    }

    &-action {
      width: 100%;
    }
  }
}
</style>