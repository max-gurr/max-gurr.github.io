<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas reflections-canvas" :viewBox="'0 0 '+this.width+' '+this.height">
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
                <feGaussianBlur in="feDisplacementMap" stdDeviation="3" />
            </filter>

            <radialGradient id="aura-fill">
                <stop offset="0%" stop-color="rgba(100, 150, 110, 0.6)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <!-- Canvas -->
            <g id="canvas" ref="main-display" clip-path="url(#clip)">
                <!-- Aura -->
                <ellipse fill="url(#aura-fill)" stroke="none"
                :cx="width/2" :cy="height*(cutoff/1.2)"
                :rx="width/1.5" :ry="(height*cutoff)" />
            </g>
        </defs>
        
        <!-- Main display -->
        <use xlink:href="#canvas" />
        <!-- Reflected display -->
        <g clip-path="url(#reflection-clip)">
            <use xlink:href="#canvas" :transform="'translate(0, '+(height+2)+') scale(1, -'+((1-cutoff)/cutoff)+')'" filter="url(#reflection-blur)" />
        </g>
    </svg>
</template>

<script>
export default {
    name: 'reflections',
    props: {
        cutoff: {
            type: Number,
            default: 0.6
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.5,
        animationRate: 40,
        maxOpacity: 0.3,
        maxVel: 2,
        animationRate: 40,
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
            // await Promise.all(this.stars.map(async (s) => {
            //     this.updateStar(s, this.width, this.height*this.cutoff, this.starSize);          
            // }));
        },
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
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

.reflections-canvas {
    background: $bg-dark-blue;
}
</style>
