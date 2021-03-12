<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas reflections-canvas" :viewBox="'0 0 '+this.width+' '+this.height">
        <defs>
            <!-- Filters -->
            <radialGradient id='f1'>
                <stop offset="0%" stop-color="transparent" />
                <stop offset="70%" :stop-color="'rgba(100, 100, 180, '+maxOpacity+')'" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
            <radialGradient id='f2'>
                <stop offset="0%" stop-color="transparent" />
                <stop offset="70%" :stop-color="'rgba(100, 180, 100, '+maxOpacity+')'" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
            <radialGradient id='f3'>
                <stop offset="0%" stop-color="transparent" />
                <stop offset="70%" :stop-color="'rgba(180, 100, 100, '+maxOpacity+')'" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <clipPath id="clip">
                <rect x="0" y="0" :width="width" :height="height*cutoff" />
            </clipPath>
            <clipPath id="reflected-clip">
                <rect x="0" :y="height*cutoff" :width="width" :height="height*(1-cutoff)" />
            </clipPath>
            
            <filter id="blur" x="0%" y="0%" width="100%" height="100%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
            </filter>

            <!-- Canvas -->
            <g id="canvas" ref="svg-canvas" clip-path="url(#clip)">
                <circle :cx="width/5" :cy="height/5" :r="height/3" fill="url(#f2)" />
                <circle :cx="width/1.25" :cy="height/4" :r="height/2.5" fill="url(#f3)" />
                <circle :cx="width/2" :cy="height/3" :r="height/1.5" fill="url(#f1)" />
            </g>
        </defs>
        
        <!-- Main display -->
        <use xlink:href="#canvas" />
        <!-- Reflected display -->
        <g clip-path="url(#reflected-clip)">
            <use xlink:href="#canvas" :transform="'translate(0, '+(height+2)+') scale(1, -'+((1-cutoff)/cutoff)+')'" filter="url(#blur)" />
        </g>
    </svg>
</template>

<script>
export default {
    name: 'reflections',
    props: {
        cutoff: {
            type: Number,
            default: 0.7
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.6,
        animationRate: 40
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
            // await Promise.all(this.particles.map(async (p) => {
                       
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
    background: radial-gradient(circle, rgba(18,12,35,1) 0%, $bg-dark-blue 100%);
}
</style>
