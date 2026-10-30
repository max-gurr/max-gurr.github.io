<template>
    <div class="page">                
        <SiteNav title="Boids"/>
            <div id="boids-background">
            <canvas ref="boidsCanvas" class="canvas boids-canvas"></canvas>
        </div>
    </div>     
</template>

<script>
import { createKoiSchool } from '@/components/background/koiFish.js'
import SiteNav from '../../components/SiteNav.vue'

const DRAW_SCALE = 1.25
const FISH_SCALE = 1.5               // extra per-fish scale, applied around each fish's centre
// Backing-store pixels per CSS pixel. The canvas is blurred by 2px in CSS, so retina
// resolution is invisible. 1 is visually identical and 4x cheaper than DPR 2.
const RENDER_SCALE = 1
const UPDATE_HZ = 60                 // simulation rate, independent of the display's refresh rate
const STEP_MS = 1000 / UPDATE_HZ
const MAX_STEPS_PER_FRAME = 5        // stops a catch-up spiral after a long pause
const RESIZE_DEBOUNCE = 150

export default {
    name: 'boids-game',
    components: { SiteNav },
    props: {
    },
    // Only what the template needs. Everything the animation loop touches is non-reactive.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
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
        this.ctx = this.$refs.boidsCanvas.getContext('2d')
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        window.addEventListener('resize', this.onResize)

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

            const canvas = this.$refs.boidsCanvas
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
                    fish[first].flockTo(fish[second])
                    fish[second].flockTo(fish[first])
                }
            }

            for (let i = 0; i < count; i += 1) {
                fish[i].applyFlocking()
                fish[i].resetFlocking()
                fish[i].update(this.worldWidth, this.worldHeight)
            }

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
        }
    },
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

#boids-background {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background: radial-gradient(circle, #022c38 0%, $bg-dark-blue 100%);

    .boids-canvas {
        z-index: 1;
        pointer-events: none;
        filter: blur(1px);
    }
}
</style>
