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
                <clipPath id="reflections-bird-waterline">
                    <path d="M -20 -100 H 80 V 18 Q 30 17 -20 18 Z" />
                </clipPath>
                <clipPath id="reflections-bird-water-reflection">
                    <path d="M -20 18 Q 30 17 80 18 V 100 H -20 Z" />
                </clipPath>
                <filter id="reflections-blur" x="0%" y="0%" width="100%" height="100%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                </filter>
                <filter id="reflections-cloud-soften" x="-15%" y="-25%" width="130%" height="150%">
                    <feGaussianBlur stdDeviation="3.5" />
                </filter>
                <filter id="reflections-bird-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" />
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

                    <g
                        v-for="(cloud, index) in clouds"
                        :key="`cloud-${index}`"
                        :transform="`translate(${cloud.x} ${cloud.y}) scale(${cloud.scale})`"
                        :opacity="cloud.opacity"
                        filter="url(#reflections-cloud-soften)"
                    >
                        <path
                            d="M 13 45
                               C 5 45 0 40 0 33
                               C 0 26 6 21 14 21
                               C 14 11 23 4 33 5
                               C 39 -2 52 -1 58 7
                               C 67 4 77 10 78 19
                               C 89 16 98 23 97 31
                               C 108 30 115 36 113 42
                               C 112 47 107 49 100 49
                               L 14 49
                               C 8 49 4 47 4 44
                               C 7 45 10 45 13 45 Z"
                            fill="#c5d9e8"
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
                <g
                    v-for="(bird, index) in birds"
                    :key="`bird-${index}`"
                    :transform="`translate(${bird.x} ${height * bird.heightFactor + Math.sin(animationTime + bird.phase) * bird.bobAmplitude})`"
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
        maxVel: 2,
        animationRate: 40,
        particles: [],
        clouds: [],
        birds: [],
        animationTime: 0,
        particleSpawnFrequency: 50,
        cloudSpawnFrequency: 280,
        frameCount: 0,
        cloudFrameCount: 0,
        particleSize: 0,
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler)
    },
    mounted() {
        this.resizeHandler()
        this.clouds = Array.from({ length: 3 }, () => this.createCloud(Math.random() * this.width))
        this.birds = Array.from({ length: 2 }, (_, index) => this.createBird(index))
        this.drawCycle = window.setInterval(this.draw, this.animationRate)
    },
    methods: {
        draw() {
            this.animationTime += this.animationRate / 1000
            this.frameCount += 1
            if (this.frameCount >= this.particleSpawnFrequency) {
                // this.spawnParticle()
                this.frameCount = 0
            }

            this.cloudFrameCount += 1
            if (this.cloudFrameCount >= this.cloudSpawnFrequency) {
                this.clouds.push(this.createCloud())
                this.cloudFrameCount = 0
            }
            this.clouds = this.clouds.filter((cloud) => this.updateCloud(cloud))

            this.particles = this.particles.filter((particle) =>
                this.updateParticle(particle, this.width, this.height * this.cutoff, this.particleSize),
            )
        },
        resizeHandler() {
            const previousWidth = this.width
            const previousHeight = this.height
            this.width = window.innerWidth
            this.height = window.innerHeight

            if (previousWidth && previousHeight) {
                this.clouds.forEach((cloud) => {
                    cloud.x *= this.width / previousWidth
                    cloud.y *= this.height / previousHeight
                })
                this.birds.forEach((bird) => {
                    bird.x *= this.width / previousWidth
                })
            }

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
        createCloud(x = null) {
            const direction = Math.random() < 0.5 ? -1 : 1
            const scale = 1.3 + Math.random() * 0.9
            const startX = x === null ? (direction < 0 ? this.width + 110 * scale : -110 * scale) : x

            return {
                x: startX,
                y: Math.random() * this.height * this.cutoff * 0.65,
                scale,
                opacity: 0.16 + Math.random() * 0.16,
                velocity: direction * (0.45 + Math.random() * 0.5),
            }
        },
        updateCloud(cloud) {
            cloud.x += cloud.velocity
            return cloud.velocity < 0 ? cloud.x > -120 * cloud.scale : cloud.x < this.width + 120 * cloud.scale
        },
        createBird(index) {
            const scale = 0.9 + Math.random() * 0.4
            const leftLimit = this.width * 0.2
            const availableWidth = Math.max(0, this.width * 0.6 - 50 * scale)

            return {
                x: leftLimit + Math.random() * availableWidth,
                scale,
                direction: index === 0 ? 1 : -1,
                heightFactor: index === 0 ? 0.9 : 0.85,
                phase: Math.random() * Math.PI * 2,
                bobAmplitude: 1.5 + Math.random() * 2,
            }
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
