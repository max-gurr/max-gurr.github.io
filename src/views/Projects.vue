<template>
  <main class="projects-page page">
    <header class="projects-page__header">
      <h1>Projects</h1>
      <router-link class="content-page__back" to="/">Back</router-link>
    </header>

    <nav class="projects-page__categories" aria-label="Project categories" role="tablist">
      <button
        id="data-tab"
        type="button"
        role="tab"
        :aria-selected="activeCategory === 'data'"
        aria-controls="data-panel"
        :class="{ 'projects-page__category--active': activeCategory === 'data' }"
        @click="activeCategory = 'data'"
      >Data Analysis</button>
      <button
        id="games-tab"
        type="button"
        role="tab"
        :aria-selected="activeCategory === 'games'"
        aria-controls="games-panel"
        :class="{ 'projects-page__category--active': activeCategory === 'games' }"
        @click="activeCategory = 'games'"
      >Games</button>
    </nav>

    <div class="projects-page__scroll">
      <section
        v-if="activeCategory === 'data'"
        id="data-panel"
        class="projects-page__grid"
        role="tabpanel"
        aria-labelledby="data-tab"
      >
        <DataAnalysisPlaceholder />
      </section>
      <section
        v-else
        id="games-panel"
        class="projects-page__grid"
        role="tabpanel"
        aria-labelledby="games-tab"
      >
        <GamesPlaceholder />
      </section>
    </div>
  </main>
</template>

<script>
import DataAnalysisPlaceholder from '@/projects/data/PlaceholderProject.vue';
import GamesPlaceholder from '@/projects/games/PlaceholderProject.vue';

export default {
  name: 'projects-page',
  components: {
    DataAnalysisPlaceholder,
    GamesPlaceholder
  },
  data: () => ({
    activeCategory: 'data'
  })
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;

.projects-page {
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
  background: radial-gradient(circle at center, #022c38 0%, #000014 75%);

  &__header {
    z-index: 2;
    display: flex;
    min-height: 5.5rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem clamp(1.5rem, 7vw, 6rem);
    border-bottom: 1px solid rgba($soft-blue, 0.24);
    background: rgba($bg-dark-blue, 0.68);
    backdrop-filter: blur(12px);

    h1 {
      margin: 0;
      color: $light-grey;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-variant: small-caps;
      letter-spacing: 0.04em;
    }

    .content-page__back {
      margin: 0;
      padding: 0.65rem 1rem;
      border: 1px solid rgba($soft-blue, 0.5);
      border-radius: 999px;
      color: $light-grey;
      transition: background-color 0.2s ease, border-color 0.2s ease;

      &:hover {
        border-color: $soft-blue;
        background: rgba($light-grey, 0.1);
        text-decoration: none;
      }
    }
  }

  &__categories {
    z-index: 1;
    display: flex;
    flex: 0 0 auto;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba($soft-blue, 0.16);
    background: rgba($bg-dark-blue, 0.42);

    button {
      min-height: 2.75rem;
      padding: 0.65rem 1.25rem;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      color: rgba($light-grey, 0.72);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;

      &:hover {
        color: $light-grey;
        background: rgba($light-grey, 0.08);
      }

      &:focus-visible {
        outline: 2px solid $soft-blue;
        outline-offset: 3px;
      }
    }

    .projects-page__category--active {
      border-color: rgba($soft-blue, 0.45);
      background: rgba($soft-blue, 0.16);
      color: $light-grey;
    }
  }

  &__scroll {
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 7vw, 6rem) 4rem;
    scrollbar-color: rgba($soft-blue, 0.55) transparent;
  }

  &__grid {
    display: grid;
    width: min(100%, 72rem);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
    gap: 1.25rem;
    margin: 0 auto;
  }
}

.project-card {
  display: grid;
  min-height: 16rem;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 34%);
  align-items: stretch;
  border: 1px solid rgba($soft-blue, 0.3);
  border-radius: 1rem;
  background: rgba($bg-dark-blue, 0.68);
  color: $light-grey;
  text-align: left;
  backdrop-filter: blur(10px);

  &__content {
    align-self: center;
    padding: clamp(1.5rem, 3vw, 2.25rem);
  }

  h2 {
    margin: 0.5rem 0 0.75rem;
    color: $light-grey;
    font-size: 1.5rem;
  }

  &__eyebrow {
    color: rgba($light-grey, 0.62);
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    color: $soft-blue;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__description {
    color: rgba($light-grey, 0.85);
    line-height: 1.65;
  }

  &__thumbnail {
    width: 100%;
    height: 100%;
    min-height: 16rem;
    object-fit: cover;
    border-left: 1px solid rgba($soft-blue, 0.18);
    border-radius: 0 1rem 1rem 0;
    background: rgba($soft-blue, 0.08);
  }
}

@media (max-width: 720px) {
  .projects-page {
    &__header {
      min-height: 4.5rem;
      padding: 0.5rem 1rem;
    }

    &__scroll {
      padding: 1.25rem 1rem 2rem;
    }
  }

  .project-card {
    grid-template-columns: 1fr;

    &__content {
      grid-row: 2;
    }

    &__thumbnail {
      grid-row: 1;
      height: 12rem;
      min-height: 0;
      border-right: 0;
      border-bottom: 1px solid rgba($soft-blue, 0.18);
      border-left: 0;
      border-radius: 1rem 1rem 0 0;
    }
  }
}
</style>
