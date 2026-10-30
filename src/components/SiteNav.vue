<template>
    <header class="topbar">
        <h1>{{ title }}</h1>
        <nav class="site-nav" aria-label="Site">
            <router-link
            v-for="link in visibleLinks"
            :key="link.to"
            :to="link.to"
            class="site-nav__link"
            >{{ link.label }}</router-link>
        </nav>
  </header>
</template>

<script>
export default {
  name: 'site-nav',
  props: {
    title: {type: String, required: true},
  },
  data: () => ({
    links: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Research', to: '/research' }
    ]
  }),
  computed: {
    visibleLinks() {
      const normalise = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);
      const current = normalise(this.$route.path);
      return this.links.filter((link) => normalise(link.to) !== current);
    }
  }
}
</script>

<style lang="scss">
@use '../assets/variables.scss' as *;
.topbar {
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
  }
.site-nav {
  display: flex;
  align-items: center;

  &__link {
    position: relative;
    margin: 0;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    color: rgba($light-grey, 0.8);
    text-decoration: none;
    transition: background-color 0.2s ease, color 0.2s ease;

    // Vertical separator between adjacent links only, so it still works
    // when the current page's link has been removed.
    & + &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      height: 1.25rem;
      border-left: 1px solid rgba($soft-blue, 0.4);
      transform: translate(-50%, -50%);
    }

    &:hover,
    &:focus-visible {
      background: rgba($soft-blue, 0.16);
      color: $light-grey;
      text-decoration: none;
    }
  }
}

@media (max-width: 720px) {
  .site-nav__link {
    padding: 0.5rem 0.65rem;
    font-size: 0.875rem;
  }
}
</style>