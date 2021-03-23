<template>
<div>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas bamboo-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <defs>
            <!-- Top bamboo pattern -->
            <pattern id="bamboo-group-1" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse" fill="rgba(3, 8, 9, 1)">
                <Bamboo />
            </pattern>
            <!-- Middle bamboo pattern -->
            <pattern id="bamboo-group-2" x="30%" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse" fill="rgba(9, 9, 7, 0.9)">
                <Bamboo />
            </pattern>
            <!-- Back bamboo pattern -->
            <pattern id="bamboo-group-3" x="60%" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse" fill="rgba(10, 15, 15, 0.8)">
                <Bamboo />
            </pattern>
        </defs>
        <!-- Back particles -->
        <g v-for="(p3, index3) in particlesLayer3" :key="'layer3-particle-'+index3" >
            <defs>
                <radialGradient :id="'layer3-gradientFill-'+index3">
                    <stop offset="25%" :stop-color="'rgba(255, 150, 100, '+(0.6)+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle :cx="p3.x" :cy="p3.y" :r="particleSize*0.5" :fill="'url(#layer3-gradientFill-'+index3+')'" class="particle" />        
        </g>
        
        <!-- Back bamboo -->
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bamboo-group-3)" />

        <!-- Middle particles -->
        <g v-for="(p2, index2) in particlesLayer2" :key="'layer2-particle-'+index2" >
            <defs>
                <radialGradient :id="'layer2-gradientFill-'+index2">
                    <stop offset="25%" :stop-color="'rgba(240, 100, 180, '+(maxOpacity/2)+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle :cx="p2.x" :cy="p2.y" :r="particleSize*0.75" :fill="'url(#layer2-gradientFill-'+index2+')'" class="particle" />        
        </g>

        <!-- Middle bamboo -->
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bamboo-group-2)" />

        <!-- Top particles -->
        <g v-for="(p1, index1) in particlesLayer1" :key="'layer1-particle-'+index1" >
            <defs>
                <radialGradient :id="'layer1-gradientFill-'+index1">
                    <stop offset="25%" :stop-color="'rgba(255, 200, 100, '+(maxOpacity)+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle :cx="p1.x" :cy="p1.y" :r="particleSize" :fill="'url(#layer1-gradientFill-'+index1+')'" class="particle" />        
        </g>
        
        <!-- Top bamboo -->
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bamboo-group-1)" />
    </svg>
</div>
</template>

<script>
import Bamboo from '../../assets/background/bamboo.svg';
export default {
    name: 'bamboo',
    components: {
        Bamboo
    },
    props: {
    },
    data: () => ({
        particlesLayer1: [],
        particlesLayer2: [],
        particlesLayer3: [],
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.3,
        maxVel: 2,
        particleSize: 0,
        numParticles: 20,
        animationRate: 40,
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mousemoveHandler);
    },
    mounted() {
        // Initialise responsive variables
        this.resizeHandler();

        // Start animation
        this.drawCycle = setInterval(this.draw.bind(this), this.animationRate);
    },
    methods: {
        async draw() {
            await Promise.all(this.particlesLayer1.map(async (p) => {
                this.updateParticle(p, this.particleSize*1.5);          
            }));
            await Promise.all(this.particlesLayer2.map(async (p) => {
                this.updateParticle(p, this.particleSize);          
            }));
            await Promise.all(this.particlesLayer3.map(async (p) => {
                this.updateParticle(p, this.particleSize);          
            }));
        },
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const divider = 15;
            this.particleSize = Math.min(this.width/divider, this.height/divider);
            this.makeParticles();
        },
        makeParticles() {
            const divider = 20000;
            const responsiveNum = (this.width * this.height)/divider;

            this.particlesLayer1 = this.makeParticleLayer(1, this.numParticles);
            this.particlesLayer2 = this.makeParticleLayer(2, this.numParticles);
            this.particlesLayer3 = this.makeParticleLayer(3, this.numParticles);
        },
        makeParticleLayer(index, numParticles) {
            const particles = [];

            for (let i = 0; i < numParticles; i++) {
                const xPos = Math.random()*this.width;
                const yPos = Math.random()*this.height;
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);

                if (xVel === 0 && yVel === 0) {
                    xVel = 1;
                    yVel = -0.6;
                }

                const scale = this.maxVel/index;
                const mag = Math.sqrt(xVel * xVel + yVel * yVel);
                xVel *= scale/mag;
                yVel *= scale/mag;

                particles.push({
                    x: xPos,
                    y: yPos,
                    xVel: xVel,
                    yVel: yVel,
                    size: 0
                });
            }

            return particles;
        },
        async updateParticle (p, range) {
            p.x += p.xVel;
            p.y += p.yVel;

            if (p.x < -range/2) {
                p.x += (this.width + range);
            } else if (p.x > this.width + range/2) {
                p.x -= (this.width + range);
            }

            if (p.y < -range/2) {
                p.y += (this.height + range);
            } else if (p.y > this.height + range/2) {
                p.y -= (this.height + range);
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('mousemove', this.mousemoveHandler);
    }
}
</script>

<style lang="scss">
@import '../../assets/variables.scss';

.bamboo-canvas {
    background: $bg-dark-green;
}
</style>
