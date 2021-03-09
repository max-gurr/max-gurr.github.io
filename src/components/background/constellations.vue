<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas constellations-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <g v-for="(p, index) in particles" :key="'particle-'+index" >
            <defs>
                <radialGradient :id="'gradientFill-'+index">
                    <stop offset="25%" :stop-color="'rgba('+(155 + 100*p.mouseDist)+', '+(155 + 100*p.x/width)+', '+(155 + 100*p.y/height)+', '+(maxOpacity+0.3*p.mouseDist)+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle :cx="p.x" :cy="p.y" :r="radius" :fill="'url(#gradientFill-'+index+')'" class="particle" />
        </g>
        <defs>
            <radialGradient id="mouseParticleFill">
                <stop offset="25%" :stop-color="'rgba(255, 255, 255, '+maxOpacity*2+')'" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
        </defs>
        <circle v-if="mouseParticle" :cx="mouseParticle.x" :cy="mouseParticle.y" :r="mouseParticle.radius" fill="url(#mouseParticleFill)" id="mouse-particle"/>
        <line v-for="(l, index) in lines" :key="'line-'+index" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" stroke="white" :opacity="l.opacity"/>
    </svg>
</template>

<script>
export default {
    name: 'connected-particles',
    props: {
        minNumParticles: {
            type: Number,
            default: 40
        },
        maxNumParticles: {
            type: Number,
            default: 150
        },
        radius: {
            type: Number,
            default: 8
        }
    },
    data: () => ({
        particles: [],
        mouseParticle: null,
        lines: [],
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        lineRange: 0,
        maxLineRange: 150,
        maxOpacity: 0.3,
        animationRate: 50
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
    },
    mounted() {
        // Initialise responsive variables
        this.resizeHandler();

        // Start animation
        // window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.animationRate);
        this.drawCycle = setInterval(this.draw.bind(this), this.animationRate);
    },
    methods: {
        async draw() {
            await Promise.all(this.particles.map(async (p) => {
                this.updateParticle(p, this.lineRange);          
            }));

            if (this.mouseParticle && this.mouseParticle.nextX !== 0) {
                this.mouseParticle.x = this.mouseParticle.nextX;
                this.mouseParticle.y = this.mouseParticle.nextY;
            }

            this.lines = await this.makeLines(this.lineRange);

            // Reset animation timeout
            // window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.animationRate);
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.calculateLineRange();
            this.makeParticles();
        },
        mouseMoveHandler(e) {
            if (!this.mouseParticle) {
                this.mouseParticle = {
                    x: -500,
                    y: -500,
                    radius: this.radius*2,
                    nextX: 0,
                    nextY: 0
                }
            }
            this.mouseParticle.nextX = e.clientX;
            this.mouseParticle.nextY = e.clientY;
        },
        calculateLineRange() {
            const divider = 5;

            let range = Math.min(this.width/divider, this.height/divider);
            this.lineRange = Math.max(100, Math.min(this.maxLineRange, range));
        },
        async makeParticles() {
            const divider = 10000;
            const particles = [];
            const responsiveNum = (this.width * this.height)/divider;
            const numParticles = Math.max(this.minNumParticles, Math.min(this.maxNumParticles, responsiveNum));
            
            for (let i = 0; i < numParticles; i++) {
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);
                const mag = Math.sqrt(xVel * xVel + yVel * yVel);

                if (mag == 0) {
                    xVel = 1;
                    yVel = 1;
                }

                const scale = Math.random() * 0.5 + 0.5;
                xVel = scale * (xVel/mag);
                yVel = scale * (yVel/mag);

                particles.push({
                    x: Math.random()*this.width,
                    y: Math.random()*this.height,
                    xVel: xVel,
                    yVel: yVel,
                    mouseDist: 0
                });
            }

            this.particles = particles;
        },
        async updateParticle (p, range) {
            // Position
            p.x += p.xVel;
            p.y += p.yVel;

            if (p.x < -range/2) {
                p.x += this.width + range;
            } else if (p.x > this.width + range/2) {
                p.x -= (this.width + range);
            }

            if (p.y < -range/2) {
                p.y += this.height + range;
            } else if (p.y > this.height + range/2) {
                p.y -= (this.height + range);
            }
        },
        async makeLines (range) {
            const lines = [];
            const squareRange = range * range;
            const particles = [...this.particles];

            // Lines between particles
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i+1; j < particles.length; j++) {
                    const p2 = particles[j];

                    const xDist = p1.x - p2.x;
                    const yDist = p1.y - p2.y;
                    const squareDist = xDist * xDist + yDist * yDist;

                    if (squareDist < squareRange) {
                        const opacity = this.maxOpacity * (squareRange - squareDist)/squareRange;
                        lines.push({
                            x1: p1.x,
                            y1: p1.y,
                            x2: p2.x,
                            y2: p2.y,
                            opacity: opacity
                        });
                    }
                }
            }

            // Mouse lines
            this.particles.forEach((p) => {
                if (this.mouseParticle) {
                    const xDist = this.mouseParticle.x - p.x;
                    const yDist = this.mouseParticle.y - p.y;
                    const squareDist = xDist * xDist + yDist * yDist;

                    if (squareDist < squareRange) {
                        const opacity = this.maxOpacity * (squareRange - squareDist)/squareRange;
                        lines.push({
                            x1: p.x,
                            y1: p.y,
                            x2: this.mouseParticle.x,
                            y2: this.mouseParticle.y,
                            opacity: opacity
                        });

                        p.mouseDist = 1 - squareDist/squareRange;
                    } else {
                        p.mouseDist = 0;
                    }
                }
            })

            return lines;
        }
    },
    beforeDestroy() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
}
</script>

<style scoped lang="scss">
@import '../../assets/variables.scss';

.constellations-canvas {
    background: $bg-dark-blue;
    background: radial-gradient(circle, rgba(18,12,35,1) 0%, $bg-dark-blue 100%);
}
</style>
