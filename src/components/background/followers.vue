<template>
    <div class="canvas follower-canvas" ref="canvasContainer">
        <!-- Followers: drawn imperatively, no Vue reactivity involved -->
        <canvas class="canvas" ref="followerCanvas"></canvas>

        <!-- Static background. Only re-renders when the window size changes -->
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + width + ' ' + height">
            <defs>
                <radialGradient id='f1'>
                    <stop offset="0%" stop-color="transparent" />
                    <stop offset="70%" stop-color="rgba(100, 100, 180, 0.125)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
                <radialGradient id='f2'>
                    <stop offset="0%" stop-color="transparent" />
                    <stop offset="70%" stop-color="rgba(50, 200, 100, 0.125)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
                <radialGradient id='f3'>
                    <stop offset="0%" stop-color="transparent" />
                    <stop offset="70%" stop-color="rgba(200, 100, 125, 0.125)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <!-- Blue circle -->
            <circle :cx="width/1.15" :cy="height/4" :r="Math.max(width/2.8, height/2)" fill="url(#f1)" />
            <!-- Green circle -->
            <circle :cx="width/10" :cy="height/6" :r="Math.max(width/3, height/2.4)" fill="url(#f2)" />
            <!-- Red circle -->
            <circle :cx="width/2.2" :cy="height" :r="Math.max(width/3, height/2.2)" fill="url(#f3)" />
        </svg>
    </div>
</template>

<script>
const MAX_FPS = 30;                   // followers move ~1.3px per frame, so 30fps looks the same as 60
const FRAME_INTERVAL = 1000 / MAX_FPS;
const TICKS_PER_SECOND = 25;          // the original loop ran every 40ms; all physics is tuned per tick
const MAX_VEL = 1.6;                  // px per tick
const MAX_FORCE = 0.5;
const FOLLOWER_OPACITY = 0.2;
const BLUR_ADJUSTMENT = 4;            // how close to an edge a follower gets before bouncing
const SIZE_DIVIDER = 3;
// The followers are huge, soft gradients, so a quarter of the resolution is indistinguishable
// and 16x cheaper to fill. Raise towards 1 if you ever see banding.
const RENDER_SCALE = 0.25;
const MAX_RIPPLES = 8;
const RESIZE_DEBOUNCE = 150;

const clampChannel = (v) => Math.max(0, Math.min(255, Math.round(v)));

export default {
    name: 'followers-background',
    props: {
        maxSize: {
            type: Number,
            default: 300
        },
        numFollowers: {
            type: Number,
            default: 25
        },
        mouseRadius: {
            type: Number,
            default: 200
        }
    },
    // Only what the template needs. Followers and the loop are deliberately NOT reactive.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight
    }),
    created() {
        this.followers = [];
        this.size = 0;
        this.ctx = null;
        this.raf = 0;
        this.lastFrame = 0;
        this.resizeTimer = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseMoved = false;
        this.reduceMotion = false;
    },
    mounted() {
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.ctx = this.$refs.followerCanvas.getContext('2d');

        window.addEventListener('resize', this.onResize);
        if (!this.reduceMotion) {
            window.addEventListener('mousemove', this.onMouseMove, { passive: true });
            window.addEventListener('click', this.onClick);
        }

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
        window.removeEventListener('click', this.onClick);
    },
    methods: {
        /* ---------- Resize ---------- */
        onResize() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(this.resize, RESIZE_DEBOUNCE);
        },
        resize() {
            const previousWidth = this.width;
            const previousHeight = this.height;
            const previousSize = this.size;

            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.size = Math.min(this.maxSize, Math.min(this.width / SIZE_DIVIDER, this.height / SIZE_DIVIDER));

            const canvas = this.$refs.followerCanvas;
            canvas.width = Math.round(this.width * RENDER_SCALE);
            canvas.height = Math.round(this.height * RENDER_SCALE);
            canvas.style.width = this.width + 'px';
            canvas.style.height = this.height + 'px';
            this.ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);   // must come after resizing

            if (this.followers.length === 0) {
                for (let i = 0; i < this.numFollowers; i++) {
                    this.followers.push(this.generateFollower());
                }
            } else {
                // Scale the existing followers to the new window instead of reshuffling them
                const scaleX = this.width / previousWidth;
                const scaleY = this.height / previousHeight;
                const scaleSize = previousSize ? this.size / previousSize : 1;
                for (const f of this.followers) {
                    f.size *= scaleSize;
                    const margin = f.size / BLUR_ADJUSTMENT;
                    f.x = Math.max(margin, Math.min(this.width - margin, f.x * scaleX));
                    f.y = Math.max(margin, Math.min(this.height - margin, f.y * scaleY));
                }
            }

            // With reduced motion there's no loop, so draw a single still frame
            if (this.reduceMotion) this.render();
        },

        /* ---------- Input ---------- */
        onMouseMove(e) {
            // Just record it; the next frame picks it up
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.mouseMoved = true;
        },
        onClick(e) {
            this.spawnRipple(e.clientX, e.clientY);

            const squareRange = this.mouseRadius * this.mouseRadius * 2;
            for (const f of this.followers) {
                this.repelFromPoint(f, e.clientX, e.clientY, squareRange);
            }
        },
        spawnRipple(x, y) {
            const container = this.$refs.canvasContainer;
            if (container.querySelectorAll('.click-ripple').length >= MAX_RIPPLES) return;   // ignore click-spam

            const ripple = document.createElement('div');
            ripple.className = 'click-ripple';
            ripple.style.top = y + 'px';
            ripple.style.left = x + 'px';
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
            container.appendChild(ripple);
        },

        /* ---------- Animation loop ---------- */
        frame(now) {
            this.raf = requestAnimationFrame(this.frame);

            const elapsed = now - this.lastFrame;
            if (elapsed < FRAME_INTERVAL - 2) return;   // skip frames to hold MAX_FPS
            this.lastFrame = now;

            // Clamp so returning to a backgrounded tab doesn't make followers jump
            this.update(Math.min(elapsed, 100) / 1000);
            this.render();
        },
        update(dt) {
            // The original stepped every 40ms. Everything below is scaled by "ticks" so the
            // motion is the same however long this frame took.
            const ticks = dt * TICKS_PER_SECOND;
            const decay = Math.pow(0.5, ticks);
            const attract = this.mouseMoved;
            this.mouseMoved = false;

            const followers = this.followers;
            for (let i = 0; i < followers.length; i++) {
                const f = followers[i];
                this.updateFollower(f, ticks, decay);
                if (attract) this.pointTowardsMouse(f, ticks);
            }
        },
        updateFollower(f, ticks, decay) {
            // Add acc to vel, vel to pos
            f.xVel += f.xAcc * ticks;
            f.yVel += f.yAcc * ticks;
            f.x += f.xVel * ticks;
            f.y += f.yVel * ticks;

            // Bounce off the edges
            if (f.x < f.size / BLUR_ADJUSTMENT) {
                f.xVel *= -1;
                f.x += 1;
            } else if (f.x > this.width - f.size / BLUR_ADJUSTMENT) {
                f.xVel *= -1;
                f.x -= 1;
            }
            if (f.y < f.size / BLUR_ADJUSTMENT) {
                f.yVel *= -1;
                f.y += 1;
            } else if (f.y > this.height - f.size / BLUR_ADJUSTMENT) {
                f.yVel *= -1;
                f.y -= 1;
            }

            // Followers always travel at a constant speed; forces only steer them
            const velMag = Math.sqrt(f.xVel * f.xVel + f.yVel * f.yVel);
            if (velMag !== 0) {
                f.xVel = MAX_VEL * (f.xVel / velMag);
                f.yVel = MAX_VEL * (f.yVel / velMag);
            }

            // Fade the acceleration
            f.xAcc *= decay;
            f.yAcc *= decay;
        },
        pointTowardsMouse(f, ticks) {
            const xDist = this.mouseX - f.x;
            const yDist = this.mouseY - f.y;

            if (xDist * xDist + yDist * yDist < this.mouseRadius * this.mouseRadius) {
                const xVelDelta = xDist - f.xVel;
                const yVelDelta = yDist - f.yVel;
                const velMag = Math.sqrt(xVelDelta * xVelDelta + yVelDelta * yVelDelta);
                if (velMag === 0) return;

                f.xAcc += MAX_FORCE * ticks * (xVelDelta / velMag);
                f.yAcc += MAX_FORCE * ticks * (yVelDelta / velMag);
            }
        },
        repelFromPoint(f, x, y, squareRange) {
            const xDist = f.x - x;
            const yDist = f.y - y;

            if (xDist * xDist + yDist * yDist < squareRange) {
                const xVelDelta = xDist - f.xVel;
                const yVelDelta = yDist - f.yVel;
                const velMag = Math.sqrt(xVelDelta * xVelDelta + yVelDelta * yVelDelta);
                if (velMag === 0) return;

                const maxMag = this.mouseRadius / velMag;
                const xForce = maxMag * 10 * (xVelDelta / velMag);
                const yForce = maxMag * 10 * (yVelDelta / velMag);

                f.xAcc += Math.min(xForce, MAX_FORCE * 20);
                f.yAcc += Math.min(yForce, MAX_FORCE * 20);
            }
        },
        render() {
            const { ctx, followers, width, height } = this;
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < followers.length; i++) {
                const f = followers[i];

                // Colour shifts with position, and flashes while a follower is being pushed
                const r = clampChannel(100 + 80 * (f.xAcc + f.yAcc));
                const g = clampChannel(50 + 155 * f.x / width);
                const b = clampChannel(50 + 155 * (f.y / height));

                const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
                grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${FOLLOWER_OPACITY})`);
                grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0)`);

                // Nothing is visible past 70% of the radius, so only fill that much
                const reach = f.size * 0.7;
                ctx.fillStyle = grad;
                ctx.fillRect(f.x - reach, f.y - reach, reach * 2, reach * 2);
            }
        },

        /* ---------- Setup ---------- */
        generateFollower() {
            // Random size
            const sizeRange = this.size - this.size / 4;
            const size = this.size - Math.random() * sizeRange;

            // Random direction (speed is normalised to MAX_VEL on the first update anyway)
            const angle = Math.random() * Math.PI * 2;

            return {
                x: Math.round(Math.random() * this.width),
                y: Math.round(Math.random() * this.height),
                xVel: Math.cos(angle) * MAX_VEL,
                yVel: Math.sin(angle) * MAX_VEL,
                xAcc: 0,
                yAcc: 0,
                size
            };
        }
    }
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

.follower-canvas {
    background-color: $bg-dark-blue;

    .click-ripple {
        position: absolute;
        // Fixed final size; the animation only scales it, so it stays on the compositor
        width: 300px;
        height: 300px;
        border-radius: 50%;
        pointer-events: none;
        animation: follower-ripple-animate 0.4s;
        transform: translate(-50%, -50%);
        box-shadow: 0px 0px 30px white,
                    inset 0px 0px 30px white;
    }
}

@keyframes follower-ripple-animate {
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
