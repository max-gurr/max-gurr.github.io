<template>
  <nav class="site-nav" aria-label="Site">
    <router-link
      v-for="link in visibleLinks"
      :key="link.to"
      :to="link.to"
      class="site-nav__link"
    >{{ link.label }}</router-link>
  </nav>
</template>

<script>
export default {
  name: 'site-nav',
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