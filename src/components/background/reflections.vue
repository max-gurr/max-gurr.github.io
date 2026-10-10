<template>
    <div id="reflections-root">
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
                <filter id="reflections-blur" x="0%" y="0%" width="100%" height="100%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                </filter>

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

                <g id="reflections-scene" clip-path="url(#reflections-clip)">
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

                    <g v-for="(particle, index) in particles" :key="`particle-${index}`">
                        <defs>
                            <radialGradient :id="`reflections-particle-fill-${index}`">
                                <stop
                                    offset="40%"
                                    :stop-color="`rgba(${150 + 150 * particle.xVel}, ${50 + 155 * particle.x / width}, ${50 + 155 * (1 - particle.y / (height * cutoff))}, ${(particle.y - particle.finalYPos) / (height * cutoff) / 2})`"
                                />
                                <stop offset="100%" stop-color="transparent" />
                            </radialGradient>
                        </defs>
                        <circle
                            :cx="particle.x"
                            :cy="particle.y"
                            :r="particle.radius"
                            :fill="`url(#reflections-particle-fill-${index})`"
                            shape-rendering="optimizeSpeed"
                        />
                    </g>

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

            <use href="#reflections-scene" />
            <g clip-path="url(#reflections-reflection-clip)">
                <use
                    href="#reflections-scene"
                    :transform="`translate(0 ${height}) scale(1 -${(1 - cutoff) / cutoff})`"
                    filter="url(#reflections-blur)"
                />
            </g>
        </svg>
    </div>
</template>

<script>
import Treeline from '../../assets/background/treeline2.svg'

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
        minParticleSize: {
            type: Number,
            default: 30,
        },
        maxParticleSize: {
            type: Number,
            default: 70,
        },
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxVel: 2.5,
        animationRate: 40,
        particles: [],
        particleSpawnFrequency: 12,
        frameCount: 0,
        particleSize: 0,
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler)
    },
    mounted() {
        this.resizeHandler()
        this.drawCycle = window.setInterval(this.draw, this.animationRate)
    },
    methods: {
        draw() {
            this.frameCount += 1
            if (this.frameCount >= this.particleSpawnFrequency) {
                this.spawnParticle()
                this.frameCount = 0
            }

            this.particles = this.particles.filter((particle) =>
                this.updateParticle(particle, this.width, this.height * this.cutoff, this.particleSize),
            )
        },
        resizeHandler() {
            this.width = window.innerWidth
            this.height = window.innerHeight

            const divider = 20
            this.particleSize = Math.min(
                this.maxParticleSize,
                Math.max(this.minParticleSize, this.width / divider),
            )
        },
        spawnParticle() {
            const x = Math.round(Math.random() * this.width)
            const velocity = this.maxVel * (Math.random() / 2 + 0.5)

            this.particles.push({
                x,
                y: this.height * this.cutoff + this.particleSize,
                xVel: velocity * (Math.random() * 0.5 - 0.25),
                yVel: -velocity * (Math.random() / 2 + 0.5),
                radius: Math.round(this.particleSize * (Math.random() + 0.5)),
                finalYPos: Math.round((Math.random() * 2 - 1) * (this.height * this.cutoff * 0.5)),
            })
        },
        updateParticle(particle, width, height, range) {
            particle.x += particle.xVel
            particle.y += particle.yVel

            return particle.x >= -range && particle.x <= width + range && particle.y >= -range
        },
    },
    beforeUnmount() {
        clearInterval(this.drawCycle)
        window.removeEventListener('resize', this.resizeHandler)
    },
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

#reflections-root {
    .reflections-canvas {
        position: absolute;
        top: 0;
        left: 0;
        background: $bg-dark-blue;
    }
}
</style>
