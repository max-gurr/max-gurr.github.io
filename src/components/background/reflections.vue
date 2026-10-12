<template>
    <div id="reflections-root">
        <!--
            The scene is split into layers so that only the small moving parts get redrawn:
              1. back   (static)  background, sky auras and their reflection. Also holds the shared clip paths.
              2. clouds (moving)  one small element per cloud, moved by the compositor
              3. front  (static)  treeline and its blurred reflection
              4. birds  (CSS)     bobbing birds
        -->
        <svg
            class="canvas reflections-canvas"
            :viewBox="`0 0 ${width} ${height}`"
            :width="width"
            :height="height"
        >
            <defs>
                <clipPath id="reflections-clip">
                    <rect x="0" y="0" :width="width" :height="height * cutoff" />
                </clipPath>
                <clipPath id="reflections-reflection-clip">
                    <rect
                        x="0"
                        :y="height * cutoff"
                        :width="width"
                        :height="height * (1 - cutoff)"
                    />
                </clipPath>

                <radialGradient id="reflections-aura-fill-1">
                    <stop offset="0%" stop-color="rgba(50, 120, 140, 0.6)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
                <radialGradient id="reflections-aura-fill-2">
                    <stop offset="0%" stop-color="rgba(120, 80, 120, 0.6)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
                <radialGradient id="reflections-aura-fill-3">
                    <stop offset="0%" stop-color="rgba(90, 150, 60, 0.6)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>

                <g id="reflections-auras" clip-path="url(#reflections-clip)">
                    <ellipse
                        fill="url(#reflections-aura-fill-1)"
                        :cx="width / 2"
                        :cy="height * (cutoff / 1.2)"
                        :rx="width / 2"
                        :ry="height * cutoff"
                    />
                    <ellipse
                        fill="url(#reflections-aura-fill-2)"
                        cx="0"
                        :cy="height * (cutoff / 1.2)"
                        :rx="width / 2"
                        :ry="height * cutoff"
                    />
                    <ellipse
                        fill="url(#reflections-aura-fill-3)"
                        :cx="width"
                        :cy="height * (cutoff / 1.2)"
                        :rx="width / 2"
                        :ry="height * cutoff"
                    />
                </g>
            </defs>

            <use href="#reflections-auras" />
            <g clip-path="url(#reflections-reflection-clip)">
                <use href="#reflections-auras" :transform="reflectTransform" />
            </g>
        </svg>

        <div ref="skyClouds" class="canvas reflections-clouds" :style="skyStyle"></div>
        <div ref="waterClouds" class="canvas reflections-clouds" :style="waterStyle"></div>

        <svg
            class="canvas reflections-layer"
            :viewBox="`0 0 ${width} ${height}`"
            :width="width"
            :height="height"
        >
            <defs>
                <!-- Explicit region (instead of a % of the bounding box) so the blur is never cropped -->
                <filter
                    id="reflections-blur"
                    filterUnits="userSpaceOnUse"
                    :x="-40"
                    :y="-40"
                    :width="width + 80"
                    :height="height * cutoff + 80"
                >
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                </filter>

                <g id="reflections-treeline" clip-path="url(#reflections-clip)">
                    <g :transform="`translate(0 -${height * (1 - cutoff)}) rotate(-3 ${width / 2} ${height / 2})`">
                        <Treeline
                            :x="-width / 5"
                            :y="width / 7"
                            :width="width * 1.5"
                            preserveAspectRatio="xMidYMax meet"
                        />
                    </g>
                </g>
            </defs>

            <use href="#reflections-treeline" />
            <g clip-path="url(#reflections-reflection-clip)">
                <use
                    href="#reflections-treeline"
                    :transform="reflectTransform"
                    filter="url(#reflections-blur)"
                />
            </g>
        </svg>

        <svg
            class="canvas reflections-layer"
            :viewBox="`0 0 ${width} ${height}`"
            :width="width"
            :height="height"
        >
            <defs>
                <clipPath id="reflections-bird-waterline">
                    <path d="M -20 -100 H 80 V 18 Q 30 17 -20 18 Z" />
                </clipPath>
                <clipPath id="reflections-bird-water-reflection">
                    <path d="M -20 18 Q 30 17 80 18 V 100 H -20 Z" />
                </clipPath>
                <filter id="reflections-bird-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" />
                </filter>
            </defs>

            <g clip-path="url(#reflections-reflection-clip)">
                <g
                    v-for="(bird, index) in birds"
                    :key="`bird-${index}`"
                    :transform="`translate(${bird.x} ${height * bird.heightFactor})`"
                >
                    <!-- The bob is a CSS animation on this wrapper, so no JS runs per frame -->
                    <g
                        class="reflections-bird-bob"
                        :style="{ '--bob': `${bird.bobAmplitude}px`, animationDelay: `-${bird.bobDelay}s` }"
                    >
                        <g clip-path="url(#reflections-bird-water-reflection)">
                            <g
                                :transform="`translate(${bird.direction < 0 ? 50 : 0} 36) scale(${bird.direction} -1) scale(${bird.scale})`"
                                opacity="0.5"
                                filter="url(#reflections-bird-blur)"
                            >
                                <ellipse cx="20" cy="18" rx="18" ry="9" fill="#000" />
                            </g>
                        </g>
                        <g clip-path="url(#reflections-bird-waterline)">
                            <g :transform="`translate(${bird.direction < 0 ? 50 : 0} 0) scale(${bird.direction} 1) scale(${bird.scale})`" fill="#000">
                                <ellipse cx="20" cy="18" rx="18" ry="9" />
                                <ellipse cx="31" cy="13" rx="4" ry="8" transform="rotate(25 31 13)" />
                                <circle cx="35" cy="6" r="6" />
                                <path d="M 40 5 L 49 8 L 40 10 Z" />
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>

<script>
import Treeline from '../../assets/background/treeline2.svg'

const MAX_FPS = 30                    // clouds drift ~0.5px per frame, so 30fps is indistinguishable from 60
const FRAME_INTERVAL = 1000 / MAX_FPS
const TICKS_PER_SECOND = 25           // the original loop ran every 40ms; cloud speeds are defined per tick
const CLOUD_SPAWN_INTERVAL = 11.2     // seconds (was 280 ticks x 40ms)
const INITIAL_CLOUDS = 3
const NUM_BIRDS = 2
const RESIZE_DEBOUNCE = 150
const CLOUD_MARKUP = `<svg width="115" height="50" viewBox="0 0 115 50" aria-hidden="true"><path d="M 13 45 C 5 45 0 40 0 33 C 0 26 6 21 14 21 C 14 11 23 4 33 5 C 39 -2 52 -1 58 7 C 67 4 77 10 78 19 C 89 16 98 23 97 31 C 108 30 115 36 113 42 C 112 47 107 49 100 49 L 14 49 C 8 49 4 47 4 44 C 7 45 10 45 13 45 Z" fill="#c5d9e8" /></svg>`

export default {
    name: 'reflections-background',
    components: {
        Treeline,
    },
    props: {
        cutoff: {
            type: Number,
            default: 0.75,
        },
        // Currently unused: the particle effect is switched off. Kept so existing usages don't break.
        minParticleSize: {
            type: Number,
            default: 30,
        },
        maxParticleSize: {
            type: Number,
            default: 70,
        },
    },
    // Only what the template needs. Clouds are moved directly in the DOM, outside Vue.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        birds: [],
    }),
    computed: {
        // Vertical squash of the reflection relative to the sky
        reflectScale() {
            return (1 - this.cutoff) / this.cutoff
        },
        reflectTransform() {
            return `translate(0 ${this.height}) scale(1 -${this.reflectScale})`
        },
        skyStyle() {
            return {
                width: `${this.width}px`,
                height: `${this.height * this.cutoff}px`,
            }
        },
        waterStyle() {
            const waterline = this.height * this.cutoff
            return {
                top: `${waterline}px`,
                width: `${this.width}px`,
                height: `${this.height - waterline}px`,
            }
        },
    },
    created() {
        this.clouds = []
        this.raf = 0
        this.lastFrame = 0
        this.spawnTimer = 0
        this.resizeTimer = 0
        this.reduceMotion = false
    },
    mounted() {
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.addEventListener('resize', this.onResize)

        this.birds = Array.from({ length: NUM_BIRDS }, (_, index) => this.createBird(index))
        for (let i = 0; i < INITIAL_CLOUDS; i += 1) {
            this.addCloud(Math.random() * this.width)
        }

        // With reduced motion the clouds stay where they started
        if (!this.reduceMotion) {
            this.lastFrame = performance.now()
            this.raf = requestAnimationFrame(this.frame)
        }
    },
    beforeUnmount() {
        cancelAnimationFrame(this.raf)
        clearTimeout(this.resizeTimer)
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        /* ---------- Resize ---------- */
        onResize() {
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(this.resize, RESIZE_DEBOUNCE)
        },
        resize() {
            const previousWidth = this.width
            const previousHeight = this.height
            this.width = window.innerWidth
            this.height = window.innerHeight

            const scaleX = this.width / previousWidth
            const scaleY = this.height / previousHeight
            this.clouds.forEach((cloud) => {
                cloud.x *= scaleX
                cloud.y *= scaleY
                this.positionCloud(cloud)
            })
            this.birds.forEach((bird) => {
                bird.x *= scaleX
            })
        },

        /* ---------- Animation loop ---------- */
        frame(now) {
            this.raf = requestAnimationFrame(this.frame)

            const elapsed = now - this.lastFrame
            if (elapsed < FRAME_INTERVAL - 2) return
            this.lastFrame = now

            // Clamp so returning to a backgrounded tab doesn't make clouds jump
            const dt = Math.min(elapsed, 100) / 1000

            this.spawnTimer += dt
            if (this.spawnTimer >= CLOUD_SPAWN_INTERVAL) {
                this.spawnTimer = 0
                this.addCloud()
            }

            const clouds = this.clouds
            const width = this.width
            for (let i = clouds.length - 1; i >= 0; i -= 1) {
                const cloud = clouds[i]
                cloud.x += cloud.velocity * dt

                const visible = cloud.velocity < 0
                    ? cloud.x > -120 * cloud.scale
                    : cloud.x < width + 120 * cloud.scale

                if (visible) {
                    this.positionCloud(cloud)
                } else {
                    this.removeCloud(cloud)
                    clouds.splice(i, 1)
                }
            }
        },

        /* ---------- Clouds ---------- */
        addCloud(x = null) {
            const direction = Math.random() < 0.5 ? -1 : 1
            const scale = 1.3 + Math.random() * 0.9
            const startX = x === null ? (direction < 0 ? this.width + 110 * scale : -110 * scale) : x

            const cloud = {
                x: startX,
                y: Math.random() * this.height * this.cutoff * 0.65,
                scale,
                opacity: 0.16 + Math.random() * 0.16,
                velocity: direction * (0.45 + Math.random() * 0.5) * TICKS_PER_SECOND,   // px per second
                skyEl: null,
                waterEl: null,
            }
            this.mountCloud(cloud)
            this.clouds.push(cloud)
        },
        mountCloud(cloud) {
            // The cloud in the sky
            const sky = document.createElement('div')
            sky.className = 'reflections-cloud reflections-cloud-sky'
            sky.style.opacity = cloud.opacity
            sky.innerHTML = CLOUD_MARKUP

            // Its reflection. The outer element is flipped, squashed and blurred; the inner one
            // scales the cloud, so the water blur stays 6px however big the cloud is.
            const water = document.createElement('div')
            water.className = 'reflections-cloud-reflection'
            const inner = document.createElement('div')
            inner.className = 'reflections-cloud'
            inner.style.opacity = cloud.opacity
            inner.style.transform = `scale(${cloud.scale})`
            inner.innerHTML = CLOUD_MARKUP
            water.appendChild(inner)

            this.$refs.skyClouds.appendChild(sky)
            this.$refs.waterClouds.appendChild(water)
            cloud.skyEl = sky
            cloud.waterEl = water

            this.positionCloud(cloud)
        },
        positionCloud(cloud) {
            // Transform only, so moving a cloud never triggers layout or repaint
            const squash = this.reflectScale
            // Reflection positions are relative to the water container, which starts at the waterline
            const reflectedY = this.height * (1 - this.cutoff) - squash * cloud.y

            cloud.skyEl.style.transform = `translate3d(${cloud.x}px, ${cloud.y}px, 0) scale(${cloud.scale})`
            cloud.waterEl.style.transform = `translate3d(${cloud.x}px, ${reflectedY}px, 0) scale(1, -${squash})`
        },
        removeCloud(cloud) {
            cloud.skyEl.remove()
            cloud.waterEl.remove()
        },

        /* ---------- Birds ---------- */
        createBird(index) {
            const scale = 0.9 + Math.random() * 0.4
            const leftLimit = this.width * 0.2
            const availableWidth = Math.max(0, this.width * 0.6 - 50 * scale)

            return {
                x: leftLimit + Math.random() * availableWidth,
                scale,
                direction: index === 0 ? 1 : -1,
                heightFactor: index === 0 ? 0.9 : 0.85,
                bobDelay: Math.random() * Math.PI * 2,          // seconds, randomises the starting phase
                bobAmplitude: 1.5 + Math.random() * 2,
            }
        },
    },
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

#reflections-root {
    .reflections-canvas,
    .reflections-layer,
    .reflections-clouds {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    .reflections-canvas {
        background: $bg-dark-blue;
    }

    // Clips clouds to the sky / the water (their inline size and top set the waterline)
    .reflections-clouds {
        overflow: hidden;
    }

    .reflections-cloud,
    .reflections-cloud-reflection {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
    }

    // Own compositor layers: JS only changes their transform, so they are never repainted
    .reflections-cloud-sky,
    .reflections-cloud-reflection {
        will-change: transform;
    }

    // The blur is applied before the element's transform, which is what makes the
    // reflection blur wider than it is tall once it is squashed
    .reflections-cloud-reflection {
        filter: blur(6px);
    }

    .reflections-cloud svg {
        display: block;
        overflow: visible;
        filter: blur(3.5px);
    }

    .reflections-bird-bob {
        animation: reflections-bird-bob 3.1416s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
    }
}

@keyframes reflections-bird-bob {
    from {
        transform: translateY(calc(var(--bob) * -1));
    }
    to {
        transform: translateY(var(--bob));
    }
}

@media (prefers-reduced-motion: reduce) {
    #reflections-root .reflections-bird-bob {
        animation: none;
    }
}
</style>
