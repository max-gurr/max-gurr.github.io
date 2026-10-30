<template>
  <main class="content-page page flex-center content-page--embedded sectioned-content">
        <div ref="scroller" class="sectioned-content__scroll">
      <div class="sectioned-content__body"><slot /></div>
    </div>
    <nav class="sectioned-content__toc" aria-label="On this page">
      <span class="sectioned-content__toc-title">On this page</span>
      <a
        v-for="section in sections"
        :key="section.id"
        :href="`#${section.id}`"
        :class="{ 'sectioned-content__toc-link--active': activeSection === section.id }"
        :aria-current="activeSection === section.id ? 'location' : undefined"
        @click.prevent="scrollToSection(section.id)"
      >{{ section.title }}</a>
    </nav>
  </main>
</template>

<script>

export default {
  name: 'sectioned-content',
  props: {
    sections: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    activeSection: ''
  }),
  mounted() {
    this.activeSection = this.sections[0]?.id || '';
    this.observer = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visibleSections.length) {
        this.activeSection = visibleSections[0].target.id;
      }
    }, {
      root: this.$refs.scroller,
      rootMargin: '-12% 0px -68% 0px',
      threshold: 0
    });
    this.sections.forEach((section) => {
      const element = this.$refs.scroller.querySelector(`#${section.id}`);
      if (element) this.observer.observe(element);
    });
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  methods: {
    scrollToSection(id) {
      this.$refs.scroller.querySelector(`#${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;

.sectioned-content {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  padding: 0;
  overflow: hidden;

  &__scroll {
    width: 100%;
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 1.5rem clamp(15rem, 23vw, 20rem) 4rem clamp(1.5rem, 7vw, 6rem);
    scroll-behavior: smooth;
    scrollbar-color: rgba($soft-blue, 0.55) transparent;
  }

  &__body {
    width: min(100%, 58rem);
    margin-inline: auto;
  }

  &__section {
    scroll-margin-top: 2rem;
    margin-bottom: 2rem;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border: 1px solid rgba($soft-blue, 0.26);
    border-radius: 1rem;
    background: rgba($bg-dark-blue, 0.68);
    color: $light-grey;
    text-align: left;
    backdrop-filter: blur(10px);

    h2 {
      margin-bottom: 1rem;
      color: $soft-blue;
      font-size: clamp(1.35rem, 3vw, 1.8rem);
      line-height: 1.2;
    }

    p,
    li {
      color: rgba($light-grey, 0.88);
      font-size: 1rem;
      line-height: 1.7;
    }

    p + p {
      margin-top: 0.75rem;
    }

    ul {
      padding-left: 1.25rem;
    }

    li + li {
      margin-top: 0.5rem;
    }
  }

  &__links {
    margin-top: 1rem;

    a {
      color: $soft-blue;
      overflow-wrap: anywhere;
    }
  }

  &__toc {
    position: absolute;
    top: calc(5.5rem + (100% - 5.5rem) / 2);
    right: clamp(1rem, 3vw, 2.5rem);
    display: flex;
    width: clamp(11rem, 17vw, 15rem);
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid rgba($soft-blue, 0.3);
    border-radius: 1rem;
    background: rgba($bg-dark-blue, 0.82);
    text-align: left;
    transform: translateY(-50%);
    backdrop-filter: blur(12px);

    &-title {
      margin: 0 0 0.5rem 0.75rem;
      color: rgba($light-grey, 0.58);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    a {
      border-left: 2px solid transparent;
      padding: 0.5rem 0.75rem;
      color: rgba($light-grey, 0.72);
      font-size: 0.875rem;
      line-height: 1.35;
      text-decoration: none;
      transition: color 0.2s ease, border-color 0.2s ease;

      &:hover {
        color: $light-grey;
      }
    }

    .sectioned-content__toc-link--active {
      border-color: $soft-blue;
      color: $light-grey;
    }
  }
}

@media (max-width: 720px) {
  .sectioned-content {
    align-items: stretch;

    &__topbar {
      min-height: 4.5rem;
      padding: 0.5rem 1rem;
    }

    &__scroll {
      padding: 1rem 1rem 2rem;
    }

    &__toc {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .sectioned-content__scroll {
    scroll-behavior: auto;
  }
}
</style>