<template>
    <div id="fish-background">
        <canvas ref="fishCanvas" class="canvas koi-fish-canvas"></canvas>
        <div ref="rippleContainer" class="canvas ripple-layer"></div>
        <svg
            class="canvas lily-layer"
            xmlns="http://www.w3.org/2000/svg"
            :viewBox="`0 0 ${width} ${height}`"
        >
            <defs>
                <radialGradient id="lily-pad-fill">
                    <stop offset="10%" stop-color="#17613f" />
                    <stop offset="100%" stop-color="#0a422f" />
                </radialGradient>
                <radialGradient id="lily-pad-shadow">
                    <stop offset="0%" stop-color="rgb(0, 100, 40)" />
                    <stop offset="35%" stop-color="rgb(0, 115, 46)" />
                </radialGradient>
                <svg id="lily-pad" viewBox="0 0 100 100">
                    <defs>
                        <clipPath id="lily-pad-shape">
                            <path d="M 0 40 a 50 50 0 1 1 0 20 L 50 50 z" />
                        </clipPath>
                    </defs>
                    <g clip-path="url(#lily-pad-shape)">
                        <circle cx="50" cy="50" r="49" fill="url(#lily-pad-fill)" />
                        <path
                            d="M 75 12
                               C 50 50 50 50 92 42
                               C 50 50 50 50 86 78
                               C 50 50 50 50 52 94
                               C 50 50 50 50 12 80
                               C 50 50 50 50 10 50
                               C 50 50 50 50 22 18
                               C 50 50 50 50 75 12"
                            fill="url(#lily-pad-shadow)"
                            opacity="0.5"
                        />
                    </g>
                </svg>
                <svg id="lily-flower" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="5" fill="rgb(100, 100, 40)" />
                    <g v-for="petal in 12" :key="`outer-petal-${petal}`">
                        <ellipse
                            cx="50"
                            cy="30"
                            rx="6"
                            ry="15"
                            fill="rgb(100, 100, 100)"
                            :transform="`rotate(${petal * 30} 50 50)`"
                        />
                    </g>
                    <g v-for="petal in 12" :key="`middle-petal-${petal}`">
                        <ellipse
                            cx="50"
                            cy="35"
                            rx="4"
                            ry="10"
                            fill="rgb(100, 90, 90)"
                            :transform="`rotate(${petal * 30 + 15} 50 50)`"
                        />
                    </g>
                    <g v-for="petal in 8" :key="`inner-petal-${petal}`">
                        <ellipse
                            cx="50"
                            cy="40"
                            rx="3"
                            ry="8"
                            fill="rgb(80, 20, 60)"
                            :transform="`rotate(${petal * 45 + 15} 50 50)`"
                        />
                    </g>
                </svg>
            </defs>

            <g
                v-for="(pad, index) in lilypads"
                :key="`lily-pad-${index}`"
                :transform="`rotate(${pad.rotation} ${pad.x + pad.size / 2} ${pad.y + pad.size / 2})`"
            >
                <use href="#lily-pad" :x="pad.x" :y="pad.y" :width="pad.size" :height="pad.size" />
                <use
                    v-if="pad.flower"
                    href="#lily-flower"
                    :x="pad.x"
                    :y="pad.y"
                    :width="pad.size"
                    :height="pad.size"
                />
            </g>
        </svg>
    </div>
</template>

<script>
import { markRaw } from 'vue'
import { createKoiSchool } from './koiFish.js'

const DRAW_SCALE = 1.25

export default {
    name: 'fish-background',
    props: {
        numLilypads: {
            type: Number,
            default: 5,
        },
        lilypadChance: {
            type: Number,
            default: 0.25,
        },
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: 1,
        context: null,
        fish: markRaw([]),
        animationFrame: null,
        lilypads: [],
    }),
    mounted() {
        window.addEventListener('resize', this.resizeHandler)
        window.addEventListener('pointerdown', this.makeRipple)
        this.resizeHandler()
        this.animationFrame = window.requestAnimationFrame(this.animate)
    },
    methods: {
        resizeHandler() {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

            const canvas = this.$refs.fishCanvas
            canvas.width = Math.round(this.width * this.pixelRatio)
            canvas.height = Math.round(this.height * this.pixelRatio)
            this.context = canvas.getContext('2d')

            const worldWidth = this.width / DRAW_SCALE
            const worldHeight = this.height / DRAW_SCALE
            const fishCount = Math.max(6, Math.min(12, Math.round(this.width / 85)))
            this.fish = markRaw(createKoiSchool(this.context, worldWidth, worldHeight, fishCount))
            this.makeLilypads()
        },
        animate() {
            const { context } = this
            context.setTransform(1, 0, 0, 1, 0, 0)
            context.clearRect(0, 0, this.$refs.fishCanvas.width, this.$refs.fishCanvas.height)
            context.setTransform(
                this.pixelRatio * DRAW_SCALE,
                0,
                0,
                this.pixelRatio * DRAW_SCALE,
                0,
                0,
            )

            for (let first = 0; first < this.fish.length; first += 1) {
                const fish = this.fish[first]
                for (let second = first + 1; second < this.fish.length; second += 1) {
                    fish.flockTo(this.fish[second])
                    this.fish[second].flockTo(fish)
                }
            }

            const worldWidth = this.width / DRAW_SCALE
            const worldHeight = this.height / DRAW_SCALE
            this.fish.forEach((fish) => {
                fish.applyFlocking()
                fish.resetFlocking()
                fish.update(worldWidth, worldHeight)
                context.save()
                context.translate(fish.x, fish.y)
                context.scale(1.5, 1.5)
                context.translate(-fish.x, -fish.y)
                fish.draw()
                context.restore()
            })

            if (Math.random() < 0.0015) {
                this.makeRipple({
                    clientX: Math.random() * this.width,
                    clientY: Math.random() * this.height,
                })
            }
            this.animationFrame = window.requestAnimationFrame(this.animate)
        },
        makeRipple(event) {
            const ripple = document.createElement('div')
            ripple.className = 'fish-ripple'
            ripple.style.left = `${event.clientX}px`
            ripple.style.top = `${event.clientY}px`

            const container = this.$refs.rippleContainer
            container.appendChild(ripple)
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
        },
        makeLilypads() {
            const size = Math.min(this.width / 8, this.height / 8)
            const pads = []
            const maxAttempts = this.numLilypads * 20

            for (let index = 0; index < this.numLilypads && index < maxAttempts; index += 1) {
                const padSize = size * (0.75 + Math.random() * 0.5)
                let pad
                let attempts = 0
                do {
                    pad = {
                        x: size + Math.random() * Math.max(0, this.width - size * 2),
                        y: size + Math.random() * Math.max(0, this.height - size * 2),
                        size: padSize,
                        rotation: Math.round(Math.random() * 365),
                        flower: Math.random() < this.lilypadChance || index == 0,
                    }
                    attempts += 1
                } while (
                    attempts < 20
                    && pads.some((other) => {
                        const dx = pad.x + pad.size / 2 - other.x - other.size / 2
                        const dy = pad.y + pad.size / 2 - other.y - other.size / 2
                        const radius = (pad.size + other.size) / 2
                        return dx * dx + dy * dy < radius * radius
                    })
                )
                pads.push(pad)
            }

            this.lilypads = pads
        },
    },
    beforeUnmount() {
        window.cancelAnimationFrame(this.animationFrame)
        window.removeEventListener('resize', this.resizeHandler)
        window.removeEventListener('pointerdown', this.makeRipple)
    },
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

#fish-background {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background: radial-gradient(circle, #022c38 0%, $bg-dark-blue 100%);

    .koi-fish-canvas {
        z-index: 1;
        filter: brightness(0.6);
        opacity: 0.4;
        pointer-events: none;
    }

    .ripple-layer {
        z-index: 2;
        pointer-events: none;

        .fish-ripple {
            position: absolute;
            border-radius: 50%;
            animation: fish-ripple-animate 0.8s ease;
            transform: translate(-50%, -50%);
            box-shadow:
                0 0 10px rgba(255, 255, 255, 0.8),
                inset 0 0 10px rgba(255, 255, 255, 0.8);
        }
    }

    .lily-layer {
        z-index: 3;
        pointer-events: none;
    }
}

@keyframes fish-ripple-animate {
    0% {
        opacity: 0.2;
        min-width: 0;
        min-height: 0;
    }
    100% {
        opacity: 0;
        min-width: 100px;
        min-height: 100px;
    }
}
</style>
