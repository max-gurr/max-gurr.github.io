<template>
    <Transition name="content-fade" mode="out-in" appear>
  <div class="home page">
    <div class="home-content-stage">
        <div key="home" class="home-container flex-center">
          <div class="home-identity">
            <h1>Max Gurr</h1>
          </div>
          <nav class="home-actions" aria-label="Portfolio pages">
            <router-link to="/about">
                <button class="home-action" type="button">About Me</button>
            </router-link>
            <router-link to="/research">
                <button class="home-action home-action--primary" type="button">Research</button>
            </router-link>
            <!-- <router-link class="home-action" to="/projects">Projects</router-link> -->
          </nav>
          <a class="home-email" href="mailto:maxd.gurr@gmail.com"><em>Currently looking for Post-Doc opportunities!</em></a>
        </div>
    </div>
  </div>
  </Transition>
</template>

<script>
export default {
  name: 'home-page'
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