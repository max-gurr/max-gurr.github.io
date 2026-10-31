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
import { createKoiSchool } from './koiFish.js'

const DRAW_SCALE = 1.25
const FISH_SCALE = 1.5               // extra per-fish scale, applied around each fish's centre
// Backing-store pixels per CSS pixel. The canvas is blurred by 2px in CSS, so retina
// resolution is invisible. 1 is visually identical and 4x cheaper than DPR 2.
const RENDER_SCALE = 1
const UPDATE_HZ = 60                 // simulation rate, independent of the display's refresh rate
const STEP_MS = 1000 / UPDATE_HZ
const MAX_STEPS_PER_FRAME = 5        // stops a catch-up spiral after a long pause
const RIPPLE_CHANCE_PER_STEP = 0.01
const MAX_RIPPLES = 12
const RESIZE_DEBOUNCE = 150

const NEIGHBOUR_RADIUS = 50
const NEIGHBOUR_ANGLE_MAX = Math.PI / 1.5
const NEIGHBOUR_ANGLE_COS = Math.cos(NEIGHBOUR_ANGLE_MAX)
const SEPARATION_RADIUS = NEIGHBOUR_RADIUS * 0.70
const NEIGHBOUR_RADIUS_SQUARED = NEIGHBOUR_RADIUS * NEIGHBOUR_RADIUS
const SEPARATION_RADIUS_SQUARED = SEPARATION_RADIUS * SEPARATION_RADIUS
const NEIGHBOUR_ANGLE_COS_SQUARED = NEIGHBOUR_ANGLE_COS * NEIGHBOUR_ANGLE_COS

const ALIGNMENT_SCALE = 0.7
const COHESION_SCALE = 0.9
const SEPARATION_SCALE = 2
const BORDER_SCALE = 0.75

function clampColour(value) {
    return Math.max(0, Math.min(255, Math.round(value)))
}

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
    // Only what the template needs. Everything the animation loop touches is non-reactive.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        lilypads: [],
    }),
    created() {
        this.fish = []
        this.ctx = null
        this.canvasWidth = 0
        this.canvasHeight = 0
        this.worldWidth = 0
        this.worldHeight = 0
        this.raf = 0
        this.lastFrame = 0
        this.accumulator = 0
        this.resizeTimer = 0
        this.reduceMotion = false
    },
    mounted() {
        this.ctx = this.$refs.fishCanvas.getContext('2d')
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        window.addEventListener('resize', this.onResize)
        window.addEventListener('pointerdown', this.makeRipple, { passive: true })

        this.resize()

        if (!this.reduceMotion) {
            this.lastFrame = performance.now()
            this.raf = requestAnimationFrame(this.frame)
        }
    },
    beforeUnmount() {
        cancelAnimationFrame(this.raf)
        clearTimeout(this.resizeTimer)
        window.removeEventListener('resize', this.onResize)
        window.removeEventListener('pointerdown', this.makeRipple)
    },
    methods: {
        /* ---------- Setup ---------- */
        onResize() {
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(this.resize, RESIZE_DEBOUNCE)
        },
        resize() {
            this.width = window.innerWidth
            this.height = window.innerHeight

            const canvas = this.$refs.fishCanvas
            this.canvasWidth = Math.round(this.width * RENDER_SCALE)
            this.canvasHeight = Math.round(this.height * RENDER_SCALE)
            canvas.width = this.canvasWidth
            canvas.height = this.canvasHeight
            canvas.style.width = `${this.width}px`
            canvas.style.height = `${this.height}px`

            this.worldWidth = this.width / DRAW_SCALE
            this.worldHeight = this.height / DRAW_SCALE
            const fishCount = Math.max(6, Math.min(12, Math.round(this.width / 85)))
            this.fish = createKoiSchool(this.ctx, this.worldWidth, this.worldHeight, fishCount)
            this.makeLilypads()

            // With reduced motion there's no loop, so draw a single still frame
            if (this.reduceMotion) this.render()
        },

        /* ---------- Animation loop ---------- */
        frame(now) {
            this.raf = requestAnimationFrame(this.frame)

            // Fixed timestep: the simulation advances at UPDATE_HZ whether the display runs
            // at 60, 120 or 144Hz, and a throttled or backgrounded tab can't cause a jump.
            this.accumulator += Math.min(now - this.lastFrame, 100)
            this.lastFrame = now

            let steps = 0
            while (this.accumulator >= STEP_MS - 1 && steps < MAX_STEPS_PER_FRAME) {
                this.step()
                this.accumulator -= STEP_MS
                steps += 1
            }
            if (steps === MAX_STEPS_PER_FRAME) this.accumulator = 0

            // Only redraw when something actually moved
            if (steps > 0) this.render()
        },
        step() {
            const fish = this.fish
            const count = fish.length

            for (let first = 0; first < count; first += 1) {
                for (let second = first + 1; second < count; second += 1) {
                    this.flockTo(fish[first], fish[second])
                    this.flockTo(fish[second], fish[first])
                }
            }

            for (let i = 0; i < count; i += 1) {
                this.applyFlocking(fish[i])

                fish[i].resetFlocking()
                
                 fish[i].bodyColour = `rgb(
                    ${clampColour(50 + 80 * (fish[i].velocityX + fish[i].velocityY))}, 
                    ${clampColour(255 * fish[i].x / this.worldWidth)}, 
                    ${clampColour(255 * fish[i].y / this.worldHeight)}
                )`
                
                fish[i].avoidBorder(this.worldWidth, this.worldHeight, BORDER_SCALE);
                fish[i].update(this.worldWidth, this.worldHeight)
            }

            if (Math.random() < RIPPLE_CHANCE_PER_STEP) {
                this.makeRipple({
                    clientX: Math.random() * this.width,
                    clientY: Math.random() * this.height,
                })
            }
        },
        
        flockTo(actor, neighbour) {
            const dx = neighbour.x - actor.x
            const dy = neighbour.y - actor.y
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared === 0 || distanceSquared >= NEIGHBOUR_RADIUS_SQUARED) return

            actor.neighbourCount += 1
            const viewDot = dx * actor.velocityX + dy * actor.velocityY
            const viewDotSquared = viewDot * viewDot
            const withinView = NEIGHBOUR_ANGLE_COS >= 0
                ? viewDot >= 0
                    && viewDotSquared >= NEIGHBOUR_ANGLE_COS_SQUARED * distanceSquared * actor.velocitySquared
                : viewDot >= 0
                    || viewDotSquared <= NEIGHBOUR_ANGLE_COS_SQUARED * distanceSquared * actor.velocitySquared

            if (withinView) {
                actor.alignmentX += neighbour.velocityX
                actor.alignmentY += neighbour.velocityY
                actor.cohesionX += neighbour.x
                actor.cohesionY += neighbour.y
            }

            if (distanceSquared <= SEPARATION_RADIUS_SQUARED) {
                const distance = Math.sqrt(distanceSquared)
                actor.separationCount += 1
                const magnitude = NEIGHBOUR_RADIUS - distance
                actor.separationX -= magnitude * dx / distance
                actor.separationY -= magnitude * dy / distance
            }
        },
        
        applyFlocking(actor) {
            if (actor.neighbourCount === 0) return
            this.applyAlignment(
                actor, 
                actor.alignmentX / actor.neighbourCount, 
                actor.alignmentY / actor.neighbourCount, 
                ALIGNMENT_SCALE
            )
            this.applyCohesion(
                actor, 
                actor.cohesionX / 
                actor.neighbourCount, 
                actor.cohesionY / actor.neighbourCount, 
                COHESION_SCALE
            )

            if (actor.separationCount > 0) {
                this.applySeparation(
                    actor, 
                    actor.separationX / actor.separationCount, 
                    actor.separationY / actor.separationCount, 
                    SEPARATION_SCALE
                )
            }
        },

        applyAlignment(actor, x, y, scale) {
            actor.addForce(x - actor.velocityX, y - actor.velocityY, scale)
        },

        applyCohesion(actor, x, y, scale) {
            actor.addForce(x - actor.x - actor.velocityX, y - actor.y - actor.velocityY, scale)
        },

        applySeparation(actor, x, y, scale) {
            actor.addForce(x - actor.velocityX, y - actor.velocityY, scale)
        },

        render() {
            const ctx = this.ctx
            const fish = this.fish
            const base = RENDER_SCALE * DRAW_SCALE
            const scale = base * FISH_SCALE
            const offset = base - scale

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

            for (let i = 0; i < fish.length; i += 1) {
                const f = fish[i]
                ctx.save()
                // One matrix instead of translate/scale/translate: scales by FISH_SCALE around the fish
                ctx.setTransform(scale, 0, 0, scale, offset * f.x, offset * f.y)
                f.draw()
                ctx.restore()
            }
        },

        /* ---------- Ripples ---------- */
        makeRipple(event) {
            const container = this.$refs.rippleContainer
            if (container.childElementCount >= MAX_RIPPLES) return   // ignore click-spam

            const ripple = document.createElement('div')
            ripple.className = 'fish-ripple'
            ripple.style.left = `${event.clientX}px`
            ripple.style.top = `${event.clientY}px`
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
            container.appendChild(ripple)
        },

        /* ---------- Lily pads ---------- */
        makeLilypads() {
            const size = Math.min(this.width / 8, this.height / 8)
            const pads = []

            for (let index = 0; index < this.numLilypads; index += 1) {
                const padSize = size * (0.75 + Math.random() * 0.5)
                let pad
                let attempts = 0
                do {
                    pad = {
                        x: size + Math.random() * Math.max(0, this.width - size * 2),
                        y: size + Math.random() * Math.max(0, this.height - size * 2),
                        size: padSize,
                        rotation: Math.round(Math.random() * 365),
                        flower: Math.random() < this.lilypadChance || index === 0,
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
        filter: blur(2px);
        opacity: 0.3;
        pointer-events: none;
    }

    .ripple-layer {
        z-index: 2;
        pointer-events: none;

        .fish-ripple {
            position: absolute;
            // Fixed final size; the animation only scales it, so it stays on the compositor
            width: 100px;
            height: 100px;
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
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(0);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>
