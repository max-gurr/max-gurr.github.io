<template>
  <article class="project-card">
    <div class="project-card__content">
      <p class="project-card__eyebrow">Data Analysis</p>
      <h2>Project title</h2>
      <p class="project-card__description">Add a concise description of the coding project, what it does, and the problem it solves.</p>
    </div>
    <img class="project-card__thumbnail" :src="thumbnail" alt="Abstract data visualisation project thumbnail">
  </article>
</template>

<script>
import thumbnail from './thumbnail.svg?url';

export default {
  name: 'data-analysis-placeholder-project',
  data: () => ({ thumbnail })
}
</script>
