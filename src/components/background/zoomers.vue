<template>
<div>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas zoomers-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        
    </svg>
</div>
</template>

<script>
export default {
    name: 'zoomers',
    props: {
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.3,
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
        },
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const divider = 15;
            this.particleSize = Math.min(this.width/divider, this.height/divider);
            this.makeZoomers();
        },
        async makeZoomers() {

        }
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

.zoomers-canvas {
    background: $bg-dark-blue;
}
</style>
