<template>
<div>
    <!-- Static backdrop: moon gradient. Only re-renders when the window size changes -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas constellations-canvas" :viewBox="'0 0 ' + width + ' ' + height">
        <radialGradient id="moon-fill">
            <stop offset="0%" stop-color="transparent" />
            <stop offset="25%" stop-color="rgba(170, 180, 150, 0.15)" />
            <stop offset="45%" stop-color="transparent" />
            <stop offset="80%" stop-color="rgba(150, 180, 170, 0.2)" />
            <stop offset="100%" stop-color="transparent" />
        </radialGradient>
        <circle
            :cx="width / 2"
            :cy="height / 1.5"
            :r="Math.max(width / 2, height / 2)"
            fill="url(#moon-fill)"
            stroke="none"
        />
    </svg>

    <!-- Particles + lines: drawn imperatively, no Vue reactivity involved -->
    <canvas class="canvas" ref="particle-canvas"></canvas>
    <div class="canvas star-canvas" ref="star-canvas"></div>
    <!-- Mountains -->
    <svg viewBox="0 0 100 100" class="canvas" x="0" :width="width" :height="height/2" preserveAspectRatio="xMinYMax meet">
        <path d="
            M 0 100
            l 0 -20
            l 10 -10
            l 5 -3
            l 3 -5
            l 4 -3
            l 3 -4
            l 5 2
            l 2 -2
            l 3 -1
            l 2 -4
            l 4 -3
            l 4 2
            l 3 3
            l 4 1
            l 2 5
            l 5 5
            l 3 5
            l 5 3
            l 4 2
            l 2 4
            l 6 3
            l 4 5
            l 2 4
            l 3 5
            l 5 2
            L 100 100 Z
        " 
        fill="rgb(2, 2, 5)" 
        stroke="none" 
        stroke-linejoin="round" />
    </svg>
    <svg viewBox="0 0 100 100" class="canvas" x="0" :width="width" :height="height/2" preserveAspectRatio="xMaxYMax meet">
        <path d="
            M 100 100
            l 0 -30
            l -4 -4
            l -5 -3
            l -3 -5
            l -2 1
            l -2 -4
            l -3 -3
            l -5 -3
            l -3 -3
            l -2 -2
            l -2 1
            l -2 2
            l -2 4
            l -3 4
            l -3 1
            l -3 3
            l -2 4
            l -4 2
            l -3 4
            l -4 1
            l -4 3
            l -5 3
            l -5 6
            l -4 3
            l -5 3
            l -3 5
            l -4 2
            l -5 3
            l -2 4
            L 0 100 Z
        " 
        fill="rgb(2, 2, 5)" 
        stroke="none" 
        stroke-linejoin="round" />
    </svg>
    <svg viewBox="0 0 100 100" class="canvas" x="0" :width="width" :height="height/2" preserveAspectRatio="xMidYMax meet">
        <path d="
            M 25 100
            l 4 -2
            l 2 -4
            l 5 -3
            l 2 -3
            l 3 -2
            l 3 -5
            l 2 2
            l 1 -1
            l 2 -4
            l 3 -2
            l 3 3
            l 4 2
            l 2 4
            l 5 5
            l 3 5
            l 4 3
            L 80 100 Z
        " 
        fill="rgb(2, 2, 5)" 
        stroke="none" 
        stroke-linejoin="round" />
    </svg>
</div>
</template>

<script>
// Tuning constants. These never change at runtime, so they live outside Vue's data.
const MAX_FPS = 30;                       // raise to 60 for smoother motion at ~2x the cost
const FRAME_INTERVAL = 1000 / MAX_FPS;
const SPEED = 12.5;                       // px per second (previously 0.5px every 40ms)
const MAX_OPACITY = 0.3;
const LINE_BUCKETS = 10;                  // lines are grouped into this many opacity levels
const LINE_STEP = MAX_OPACITY / LINE_BUCKETS;
const NUM_PARTICLES_DIVIDER = 10000;
const LINE_RANGE_DIVIDER = 4.5;
const SHOOTING_STARS_PER_SECOND = 0.5;
const MAX_SHOOTING_STARS = 4;
const RESIZE_DEBOUNCE = 150;

export default {
    name: 'connected-particles',
    props: {
        minNumParticles: { type: Number, default: 50 },
        maxNumParticles: { type: Number, default: 180 },
        radius: { type: Number, default: 5 },
        maxLineRange: { type: Number, default: 150 }
    },
    // Only what the template needs. Particles, mouse etc. are deliberately NOT reactive.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight
    }),
    created() {
        this.particles = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.ctx = null;
        this.dpr = 1;
        this.lineRange = 0;
        this.raf = 0;
        this.lastFrame = 0;
        this.resizeTimer = 0;
        this.activeShootingStars = 0;
        this.reduceMotion = false;
    },
    mounted() {
        this.ctx = this.$refs['particle-canvas'].getContext('2d');
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.addEventListener('resize', this.onResize);
        window.addEventListener('mousemove', this.onMouseMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', this.onMouseLeave);

        this.resize();

        if (!this.reduceMotion) {
            this.lastFrame = performance.now();
            this.raf = requestAnimationFrame(this.frame);
        }
    },
    beforeUnmount() {
        cancelAnimationFrame(this.raf);
        clearTimeout(this.resizeTimer);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('mousemove', this.onMouseMove);
        document.documentElement.removeEventListener('mouseleave', this.onMouseLeave);
    },
    methods: {
        /* ---------- Event handlers ---------- */
        onResize() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(this.resize, RESIZE_DEBOUNCE);
        },
        onMouseMove(e) {
            // Just record the position; the next frame picks it up
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouse.active = true;
        },
        onMouseLeave() {
            this.mouse.active = false;
        },

        /* ---------- Setup ---------- */
        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);

            const canvas = this.$refs['particle-canvas'];
            canvas.width = Math.round(this.width * this.dpr);
            canvas.height = Math.round(this.height * this.dpr);
            canvas.style.width = this.width + 'px';
            canvas.style.height = this.height + 'px';
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);   // must come after resizing

            const range = Math.min(this.width, this.height) / LINE_RANGE_DIVIDER;
            this.lineRange = Math.max(this.maxLineRange / 2, Math.min(this.maxLineRange, range));

            this.syncParticleCount();

            // With reduced motion there's no loop, so draw a single still frame
            if (this.reduceMotion) this.render();
        },
        syncParticleCount() {
            const responsive = (this.width * this.height) / NUM_PARTICLES_DIVIDER;
            const target = Math.ceil(Math.max(this.minNumParticles, Math.min(this.maxNumParticles, responsive)));
            const particles = this.particles;

            // Add/remove particles instead of regenerating them all, so a resize doesn't reshuffle the sky
            while (particles.length > target) particles.pop();
            while (particles.length < target) {
                const angle = Math.random() * Math.PI * 2;
                particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: Math.cos(angle) * SPEED,
                    vy: Math.sin(angle) * SPEED,
                    md: 0                      // closeness to the mouse, 0..1
                });
            }
        },

        /* ---------- Animation loop ---------- */
        frame(now) {
            this.raf = requestAnimationFrame(this.frame);

            const elapsed = now - this.lastFrame;
            if (elapsed < FRAME_INTERVAL - 2) return;   // skip frames to hold MAX_FPS
            this.lastFrame = now;

            // Clamp so returning to a backgrounded tab doesn't make particles jump
            const dt = Math.min(elapsed, 100) / 1000;

            this.update(dt);
            this.render();

            if (Math.random() < SHOOTING_STARS_PER_SECOND * dt) {
                this.spawnShootingStar();
            }
        },
        update(dt) {
            const particles = this.particles;
            const { width, height, lineRange } = this;
            const pad = lineRange / 2;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                if (p.x < -pad) p.x += width + lineRange;
                else if (p.x > width + pad) p.x -= width + lineRange;

                if (p.y < -pad) p.y += height + lineRange;
                else if (p.y > height + pad) p.y -= height + lineRange;
            }
        },
        render() {
            const { ctx, particles, mouse, width, height, radius } = this;
            const sqRange = this.lineRange * this.lineRange;
            const n = particles.length;

            // One Path2D per opacity level, so each level is a single stroke() call
            const paths = new Array(LINE_BUCKETS + 1).fill(null);
            const addLine = (x1, y1, x2, y2, sqDist) => {
                const level = Math.floor(((sqRange - sqDist) / sqRange) * LINE_BUCKETS);
                if (level < 1) return;
                const path = paths[level] || (paths[level] = new Path2D());
                path.moveTo(x1, y1);
                path.lineTo(x2, y2);
            };

            // 1. Work out the lines, plus each particle's closeness to the mouse
            for (let i = 0; i < n; i++) {
                const a = particles[i];

                for (let j = i + 1; j < n; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    if (dx * dx >= sqRange) continue;      // cheap early-out
                    const dy = a.y - b.y;
                    const sqDist = dx * dx + dy * dy;
                    if (sqDist < sqRange) addLine(a.x, a.y, b.x, b.y, sqDist);
                }

                a.md = 0;
                if (mouse.active) {
                    const dx = mouse.x - a.x;
                    const dy = mouse.y - a.y;
                    const sqDist = dx * dx + dy * dy;
                    if (sqDist < sqRange) {
                        addLine(a.x, a.y, mouse.x, mouse.y, sqDist);
                        a.md = 1 - sqDist / sqRange;
                    }
                }
            }

            ctx.clearRect(0, 0, width, height);

            // 2. Particles
            for (let i = 0; i < n; i++) {
                const p = particles[i];
                const r = Math.round(100 + 155 * p.md);
                const g = Math.round(100 + (155 * p.x) / width);
                const b = Math.round(100 + (155 * p.y) / height);

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
                grad.addColorStop(0.25, `rgb(${r}, ${g}, ${b})`);
                grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.globalAlpha = MAX_OPACITY + 0.3 * p.md;
                ctx.fillStyle = grad;
                ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
            }

            // 3. Mouse particle
            if (mouse.active) {
                const mr = radius * 2;
                const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mr);
                grad.addColorStop(0.25, `rgba(255, 255, 255, ${MAX_OPACITY * 2})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.globalAlpha = 1;
                ctx.fillStyle = grad;
                ctx.fillRect(mouse.x - mr, mouse.y - mr, mr * 2, mr * 2);
            }

            // 4. Lines
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            for (let level = 1; level <= LINE_BUCKETS; level++) {
                if (!paths[level]) continue;
                ctx.globalAlpha = level * LINE_STEP;
                ctx.stroke(paths[level]);
            }
            ctx.globalAlpha = 1;
        },

        /* ---------- Shooting stars (CSS-animated, runs on the compositor) ---------- */
        spawnShootingStar() {
            if (this.activeShootingStars >= MAX_SHOOTING_STARS) return;

            const host = this.$refs['star-canvas'];
            const angleRange = 160;
            const rotation = Math.round(Math.random() * angleRange - angleRange / 2);

            const star = document.createElement('div');
            star.className = 'shooting-star';
            star.style.left = Math.random() * this.width + 'px';
            star.style.top = (Math.random() * this.height) / 2 + 'px';
            star.style.transform = `rotate(${rotation}deg)`;

            this.activeShootingStars++;
            star.addEventListener('animationend', () => {
                star.remove();
                this.activeShootingStars--;
            }, { once: true });

            host.appendChild(star);
        }
    }
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

.constellations-canvas {
    background: $bg-dark-blue;
    background: radial-gradient(circle, rgba(18,12,35,1) 0%, $bg-dark-blue 100%);
}

.star-canvas {
    .shooting-star {
        position: absolute;
        width: 5px;
        height: 20vh;
        border-radius: 99px;
        overflow: hidden;

        &::after {
            background-color: rgba(255, 255, 255, 0.2);
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            animation: shooting-star 0.5s ease;
            will-change: transform;
        }
    }

    @keyframes shooting-star {
        0% {
            transform: translateY(-100%);
        }
        100% {
            transform: translateY(100%);
        }
    }
}
</style>
