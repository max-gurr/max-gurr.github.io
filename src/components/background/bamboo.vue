<template>
<!--
    Layers, back to front. Each bamboo layer is its own element so the mouse parallax is a
    compositor-only transform instead of a repaint of a full-screen pattern fill.
      1. back particles   (canvas)  layers 3 + 2
      2. middle bamboo    (svg)
      3. front particles  (canvas)  layer 1
      4. top bamboo       (svg)
-->
<div class="canvas bamboo-canvas" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="back-particles" class="bamboo-layer"></canvas>

    <svg ref="middle-layer" class="bamboo-layer bamboo-parallax" xmlns="http://www.w3.org/2000/svg" :viewBox="'0 0 ' + width + ' ' + height" :width="width" :height="height">
        <defs>
            <!-- Back bamboo pattern -->
            <pattern id="bamboo-group-2" :x="width / 2" y="0" :width="width" :height="height" patternUnits="userSpaceOnUse" fill="rgba(8, 8, 14, 1)">
                <Bamboo />
            </pattern>
        </defs>
        <!-- Extends left of the screen so the layer never shows an edge as it shifts right -->
        <rect :x="-parallaxMargin" y="0" :width="width + parallaxMargin" :height="height" fill="url(#bamboo-group-2)" />
    </svg>

    <canvas ref="front-particles" class="bamboo-layer"></canvas>

    <svg ref="top-layer" class="bamboo-layer bamboo-parallax" xmlns="http://www.w3.org/2000/svg" :viewBox="'0 0 ' + width + ' ' + height" :width="width" :height="height">
        <defs>
            <!-- Top bamboo pattern -->
            <pattern id="bamboo-group-1" x="-20" y="0" :width="width" :height="height" patternUnits="userSpaceOnUse" fill="rgba(14, 10, 20, 0.8)">
                <Bamboo />
            </pattern>
        </defs>
        <rect :x="-parallaxMargin" y="0" :width="width + parallaxMargin" :height="height" fill="url(#bamboo-group-1)" />
    </svg>
</div>
</template>

<script>
import Bamboo from '../../assets/background/bamboo.svg';

const MAX_FPS = 30;                   // particles drift 0.6-1.7px per frame, so 30fps looks the same as 60
const FRAME_INTERVAL = 1000 / MAX_FPS;
const TICKS_PER_SECOND = 25;          // the original loop ran every 40ms; speeds were defined per tick
const MAX_VEL = 2;                    // px per tick for the front layer; slower layers divide this
const MAX_OPACITY = 0.3;
const NUM_PARTICLES = 15;             // per layer
const SIZE_DIVIDER = 15;
// The particles are soft gradients, so half resolution is indistinguishable and 4x cheaper to fill
const RENDER_SCALE = 0.5;
const PARALLAX_TOP = 0.02;            // fraction of the screen width the layers can shift
const PARALLAX_MIDDLE = 0.03;
const RESIZE_DEBOUNCE = 150;

// Soft round glow: flat colour in the centre fading to transparent at the edge
function drawGlow(ctx, x, y, radius, r, g, b, a) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, ${a})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

export default {
    name: 'bamboo-background',
    components: {
        Bamboo
    },
    props: {
    },
    // Only what the template needs. Particles and the loop are deliberately NOT reactive.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight
    }),
    computed: {
        parallaxMargin() {
            return Math.ceil(Math.max(PARALLAX_TOP, PARALLAX_MIDDLE) * this.width);
        }
    },
    created() {
        this.layers = [[], [], []];     // [front, middle, back]
        this.particleSize = 0;
        this.ctxBack = null;
        this.ctxFront = null;
        this.raf = 0;
        this.lastFrame = 0;
        this.resizeTimer = 0;
        this.mouseX = 0;
        this.parallaxRaf = 0;
        this.reduceMotion = false;
    },
    mounted() {
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.ctxBack = this.$refs['back-particles'].getContext('2d');
        this.ctxFront = this.$refs['front-particles'].getContext('2d');

        window.addEventListener('resize', this.onResize);
        if (!this.reduceMotion) {
            window.addEventListener('mousemove', this.onMouseMove, { passive: true });
        }

        this.resize();

        if (!this.reduceMotion) {
            this.lastFrame = performance.now();
            this.raf = requestAnimationFrame(this.frame);
        }
    },
    beforeUnmount() {
        cancelAnimationFrame(this.raf);
        cancelAnimationFrame(this.parallaxRaf);
        clearTimeout(this.resizeTimer);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('mousemove', this.onMouseMove);
    },
    methods: {
        /* ---------- Resize ---------- */
        onResize() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(this.resize, RESIZE_DEBOUNCE);
        },
        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.particleSize = Math.min(this.width / SIZE_DIVIDER, this.height / SIZE_DIVIDER);

            for (const [ref, ctx] of [['back-particles', this.ctxBack], ['front-particles', this.ctxFront]]) {
                const canvas = this.$refs[ref];
                canvas.width = Math.round(this.width * RENDER_SCALE);
                canvas.height = Math.round(this.height * RENDER_SCALE);
                canvas.style.width = this.width + 'px';
                canvas.style.height = this.height + 'px';
                ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);   // must come after resizing
            }

            // Keep existing particles on resize; they wrap into the new bounds on their own
            if (this.layers[0].length === 0) {
                this.layers = [1, 2, 3].map((index) => this.makeParticleLayer(index));
            }

            // With reduced motion there's no loop, so draw a single still frame
            if (this.reduceMotion) this.render();
        },

        /* ---------- Mouse parallax ---------- */
        onMouseMove(e) {
            // Record the position and apply it once per frame, however many events fire
            this.mouseX = e.clientX;
            if (!this.parallaxRaf) {
                this.parallaxRaf = requestAnimationFrame(this.applyParallax);
            }
        },
        applyParallax() {
            this.parallaxRaf = 0;
            const w = this.width;
            const top = PARALLAX_TOP * (w - this.mouseX);          // (1 - x/w) * 2% of the width
            const middle = PARALLAX_MIDDLE * this.mouseX;          // (x/w) * 3% of the width

            this.$refs['top-layer'].style.transform = `translate3d(${top}px, 0, 0)`;
            this.$refs['middle-layer'].style.transform = `translate3d(${middle}px, 0, 0)`;
        },

        /* ---------- Particles ---------- */
        makeParticleLayer(index) {
            const particles = [];
            const speed = (MAX_VEL / index) * TICKS_PER_SECOND;     // px per second

            for (let i = 0; i < NUM_PARTICLES; i++) {
                const angle = Math.random() * Math.PI * 2;
                particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed
                });
            }

            return particles;
        },
        frame(now) {
            this.raf = requestAnimationFrame(this.frame);

            const elapsed = now - this.lastFrame;
            if (elapsed < FRAME_INTERVAL - 2) return;   // skip frames to hold MAX_FPS
            this.lastFrame = now;

            // Clamp so returning to a backgrounded tab doesn't make particles jump
            this.update(Math.min(elapsed, 100) / 1000);
            this.render();
        },
        update(dt) {
            const { width, height, particleSize: size, layers } = this;
            const ranges = [size * 1.5, size, size];

            for (let l = 0; l < layers.length; l++) {
                const range = ranges[l];
                const particles = layers[l];

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;

                    if (p.x < -range / 2) p.x += width + range;
                    else if (p.x > width + range / 2) p.x -= width + range;

                    if (p.y < -range / 2) p.y += height + range;
                    else if (p.y > height + range / 2) p.y -= height + range;
                }
            }
        },
        render() {
            const { ctxBack, ctxFront, width, height, particleSize: size } = this;
            const [front, middle, back] = this.layers;

            ctxBack.clearRect(0, 0, width, height);
            ctxFront.clearRect(0, 0, width, height);

            // Behind the middle bamboo: back layer, then middle layer
            for (let i = 0; i < back.length; i++) {
                drawGlow(ctxBack, back[i].x, back[i].y, size * 0.5, 200, 120, 100, 0.6);
            }
            for (let i = 0; i < middle.length; i++) {
                drawGlow(ctxBack, middle[i].x, middle[i].y, size * 0.75, 240, 100, 180, MAX_OPACITY / 2);
            }

            // Between the middle and top bamboo. Colour shifts with position.
            for (let i = 0; i < front.length; i++) {
                const p = front[i];
                drawGlow(
                    ctxFront, p.x, p.y, size,
                    Math.round((p.x / width)),
                    50,
                    Math.round((50 * p.x / height)),
                    MAX_OPACITY
                );
            }
        }
    }
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

.bamboo-canvas {
    background: $bg-dark-green;
    // Clips the bamboo layers that extend past the screen edge for the parallax
    overflow: hidden;

    .bamboo-layer {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    // Own compositor layers: JS only changes their transform, so they are never repainted
    .bamboo-parallax {
        overflow: visible;
        will-change: transform;
    }
}
</style>
