<template>
  <article class="project-card">
    <div class="project-card__content">
      <p class="project-card__eyebrow">Games</p>
      <h2>Project title</h2>
      <p class="project-card__description">Add a concise description of the game project, its gameplay, and what you built.</p>
    </div>
    <img class="project-card__thumbnail" :src="thumbnail" alt="Abstract game project thumbnail">
  </article>
</template>

<script>
import thumbnail from './thumbnail.svg?url';

export default {
  name: 'games-placeholder-project',
  data: () => ({ thumbnail })
}
</script>
