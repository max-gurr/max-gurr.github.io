<template>
    <article>
        <component
            :is="link ? 'router-link' : 'div'"
            class="project-card"
            :class="{ 'project-card--static': !link }"
            v-bind="link ? { to: link } : {}"
        >
            <div class="project-card__content">
                <h2>{{ title }}</h2>
                <p v-if="description" class="project-card__description">{{ description }}</p>
            </div>
            <img v-if="thumbnailSrc" class="project-card__thumbnail" :src="thumbnailSrc" :alt="alt">
        </component>
    </article>
</template>

<script>
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
            type: [String, Object]
        },
        // Already-imported image URL (optional)
        image: {
            type: String
        },
        // Name of an svg in src/assets/pictures, without extension: "koi_thumbnail"
        svg: {
            type: String
        },
        alt: {
            type: String,
            default: 'Project thumbnail'
        }
    },
    data: () => ({ svgSrc: null }),
    computed: {
        thumbnailSrc() {
            return this.svgSrc || this.image
        }
    },
    watch: {
        svg: {
            immediate: true,
            async handler(name) {
                this.svgSrc = null
                if (!name) return
                try {
                    // The folder and ".svg?url" must stay literal so Vite can bundle the files
                    const module = await import(`@/assets/pictures/${name}.svg?url`)
                    this.svgSrc = module.default
                } catch (error) {
                    console.warn(`[project-card] Could not load svg "${name}"`, error)
                }
            }
        }
    }
}
</script>