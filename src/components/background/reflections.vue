<template>
<div ref="root" id="reflections-root">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas reflections-canvas" :viewBox="'0 0 '+this.width+' '+this.height" :width="width" :height="height">
        <defs>
            <clipPath id="clip">
                <rect x="0" y="0" :width="width" :height="height*cutoff" />
            </clipPath>
            <clipPath id="reflection-clip">
                <rect x="0" :y="height*cutoff" :width="width" :height="height*(1-cutoff)" />
            </clipPath>
            
            <filter id="reflection-blur" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence id="sea-filter" baseFrequency="0.01 0.03"></feTurbulence>
                <feDisplacementMap scale="50" in="SourceGraphic"></feDisplacementMap>
                <feGaussianBlur in="feDisplacementMap" stdDeviation="5" />
            </filter>

            <radialGradient id="aura-fill-1">
                <stop offset="0%" stop-color="rgba(50, 120, 140, 0.6)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
            <radialGradient id="aura-fill-2">
                <stop offset="0%" stop-color="rgba(120, 80, 120, 0.6)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
            <radialGradient id="aura-fill-3">
                <stop offset="0%" stop-color="rgba(90, 150, 60, 0.6)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <!-- Canvas -->
            <g id="canvas" ref="main-display" clip-path="url(#clip)">
                <!-- Aura -->
                <ellipse fill="url(#aura-fill-1)" stroke="none"
                :cx="width/2" :cy="height*(cutoff/1.2)"
                :rx="width/2" :ry="(height*cutoff)" />
                <ellipse fill="url(#aura-fill-2)" stroke="none"
                cx="0" :cy="height*(cutoff/1.2)"
                :rx="width/2" :ry="(height*cutoff)" />
                <ellipse fill="url(#aura-fill-3)" stroke="none"
                :cx="width" :cy="height*(cutoff/1.2)"
                :rx="width/2" :ry="(height*cutoff)" />


                
                <!-- Particles -->
                <g v-for="(p, particleIndex) in particles" :key="'particle-'+particleIndex">
                    <radialGradient :id="'particleFill-'+particleIndex">
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="40%" :stop-color="'rgba('+(150 + 150*(p.xVel))+', '+ (50 + 155*p.x/width)+', '+(50 + 155*(1 - p.y/(height*cutoff)))+', '+((p.y - p.finalYPos)/(height*cutoff))/2+')'" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                    <circle :cx="p.x" 
                        :cy="p.y" 
                        :r="p.radius" 
                        stroke="none" 
                        :fill="'url(#particleFill-'+particleIndex+')'" 
                    />
                </g>

                <!-- <Treeline x="0" y="0" class="trees" fill="black"/> -->
                <g :transform="'translate(0 -'+height*(1-cutoff)+') rotate(-3 '+width/2+' '+height/2+')'">
                    <Treeline :x="-width/5" :y="width/7" :width="width*1.5" preserveAspectRatio="xMidYMax meet"/>
                </g>
            </g>
        </defs>
        
        <!-- Main display -->
        <use xlink:href="#canvas" />
        <!-- Reflected display -->
        <g clip-path="url(#reflection-clip)">
            <use xlink:href="#canvas" :transform="'translate(-20, '+(height+2)+') scale(1, -'+((1-cutoff)/cutoff)+')'" filter="url(#reflection-blur)" />
        </g>
    </svg>
</div>
</template>

<script>
import Treeline from '../../assets/background/treeline2.svg';

export default {
    name: 'reflections',
    components: {
        Treeline
    },
    props: {
        cutoff: {
            type: Number,
            default: 0.7
        },
        minParticleSize: {
            type: Number,
            default: 30
        },
        maxParticleSize: {
            type: Number,
            default: 60
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.5,
        animationRate: 40,
        maxOpacity: 0.3,
        maxVel: 2.5,
        animationRate: 40,
        particles: [],
        particleSpawnFrequency: 15,
        frameCount: 0,
        particleSize: 0
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
    },
    mounted() {
        // Initialise responsive variables
        this.resizeHandler();

        // Start animation
        this.drawCycle = setInterval(this.draw.bind(this), this.animationRate);
    },
    methods: {
        async draw() {
            this.frameCount += 1;
            if (this.frameCount === this.particleSpawnFrequency) {
                this.spawnParticle();
                this.frameCount = 0;
            }

            const newParticles = [];
            await Promise.all(this.particles.map(async (p) => {
                if (await this.updateParticle(p, this.width, this.height*this.cutoff, this.particleSize)) {
                    newParticles.push(p);
                }
            }));
            this.particles = newParticles;
        },
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const divider = 20;
            this.particleSize = Math.min(this.maxParticleSize, Math.max(this.minParticleSize, this.width/divider));
        },
        async spawnParticle() {
            const xPos = Math.round(Math.random() * this.width);
            
            const velMag = this.maxVel * (Math.random()/2 + 0.5);
            const xVel = velMag * (Math.random() * 0.5 - 0.25);
            const yVel = -velMag * (Math.random()/2 + 0.5);

            const radius = Math.round(this.particleSize * (Math.random() + 0.5));
            const finalYPos = Math.round((Math.random()*2-1) * (this.height * this.cutoff * 0.5));
            const fill = xPos%2 === 0 ? true : false;

            this.particles.push({
                x: xPos,
                y: (this.height*this.cutoff + this.particleSize),
                xVel: xVel,
                yVel: yVel,
                radius: radius,
                finalYPos: finalYPos,
                fill: fill
            });
        },
        async updateParticle(p, width, height, range) {
            p.x += p.xVel;
            p.y += p.yVel;

            if (p.x < -range) {
                return false;
            } else if (p.x > width + range) {
                return false;
            }

            // Particle only travels up, so don't need to check bottom of screen
            if (p.y < -range) {
                return false;
            }

            p.opacity -= p.opacityDelta;
            if (p.opacity < 0.01) {
                return false;
            }

            return true;
        }
    },
    beforeDestroy() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
    }
}
</script>

<style lang="scss">
@import '../../assets/variables.scss';

#reflections-root {
    .reflections-canvas {
        position: absolute;
        top: 0;
        left: 0;
        background: $bg-dark-blue;
    }
}
</style>
