<template>
    <article>
        <component
            :is="link ? 'router-link' : 'div'"
            class="project-card"
            :class="{ 'project-card--static': !link }"
            v-bind="link ? { to: link } : {}"
        >
            <div class="project-card__content">
                <h2>{{title}}</h2>
                <p v-if="description" class="project-card__description">{{ description }}</p>
            </div>
            <img class="project-card__thumbnail" :src="thumbnail" alt="Abstract game project thumbnail">
        </component>
    </article>
</template>

<script>
import thumbnail from './games/thumbnail.svg?url';

export default {
  name: 'project-card',
  props: {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    link: {
        type: String
    }
  },
    data: () => ({ thumbnail })
}
</script>
