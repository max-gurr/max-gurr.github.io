<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas constellations-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <!-- Page particles -->
        <g v-for="(p, index) in particles" :key="'particle-'+index" >
            <defs>
                <radialGradient :id="'gradientFill-'+index">
                    <stop offset="25%" :stop-color="'rgba('+(100 + 155*p.mouseDist)+', '+(100 + 155*p.x/width)+', '+(100 + 155*p.y/height)+', '+(maxOpacity+0.3*p.mouseDist)+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle :cx="p.x" :cy="p.y" :r="radius" :fill="'url(#gradientFill-'+index+')'" class="particle" />
        
            <!-- <line v-for="(l, lineIndex) in particles" :key="'line-'+lineIndex" v-if="(p.x - l.x)*(p.x - l.x)+(p.y - l.y)*(p.y - l.y) < squareMaxLineRange" :x1="p.x" :y1="p.y" :x2="l.x" :y2="l.y" stroke="white" /> -->
        </g>

        <!-- Mouse particle -->
        <g>
            <defs>
                <radialGradient id="mouseParticleFill">
                    <stop offset="25%" :stop-color="'rgba(255, 255, 255, '+maxOpacity*2+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle v-if="mouseParticle" :cx="mouseParticle.x" :cy="mouseParticle.y" :r="mouseParticle.radius" fill="url(#mouseParticleFill)" id="mouse-particle" />
        </g>

        <!-- Lines -->
        <g>
            <line v-for="(l, index) in lines" :key="'line-'+index" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" :stroke="'rgba(255, 255, 255, '+l.opacity+')'" />
        </g>
    </svg>
</template>

<script>
export default {
    name: 'connected-particles',
    props: {
        minNumParticles: {
            type: Number,
            default: 50
        },
        maxNumParticles: {
            type: Number,
            default: 100
        },
        radius: {
            type: Number,
            default: 5
        },
        maxLineRange: {
            type: Number,
            default: 125
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
        maxOpacity: 0.3,
        animationRate: 40
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mousemoveHandler);
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
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.calculateLineRange();
            this.makeParticles();
        },
        async mousemoveHandler(e) {
            if (!this.mouseParticle) {
                this.mouseParticle = {
                    x: -500,
                    y: -500,
                    radius: this.radius*2,
                    nextX: 0,
                    nextY: 0
                }
            }
            this.mouseParticle.nextX = Math.round(e.clientX);
            this.mouseParticle.nextY = Math.round(e.clientY);
        },
        calculateLineRange() {
            const divider = 4.5;

            let range = Math.min(this.width/divider, this.height/divider);
            this.lineRange = Math.max(this.maxLineRange/2, Math.min(this.maxLineRange, range));
        },
        async makeParticles() {
            const divider = 8000;
            const particles = [];
            const responsiveNum = (this.width * this.height)/divider;
            const numParticles = Math.max(this.minNumParticles, Math.min(this.maxNumParticles, responsiveNum));
            
            for (let i = 0; i < numParticles; i++) {
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);

                if (xVel === 0 && yVel === 0) {
                    xVel = 1;
                    yVel = -0.6;
                }

                const mag = Math.sqrt(xVel * xVel + yVel * yVel);
                xVel *= 0.5/mag;
                yVel *= 0.5/mag;

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
            p.x += p.xVel;
            p.y += p.yVel;

            if (p.x < -this.lineRange) {
                p.x += this.width + this.lineRange*2;
            } else if (p.x > this.width + this.lineRange) {
                p.x -= (this.width + this.lineRange*2);
            }

            if (p.y < -this.lineRange) {
                p.y += this.height + this.lineRange*2;
            } else if (p.y > this.height + this.lineRange) {
                p.y -= (this.height + this.lineRange*2);
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
                            x1: Math.round(p1.x),
                            y1: Math.round(p1.y),
                            x2: Math.round(p2.x),
                            y2: Math.round(p2.y),
                            opacity: Math.round(opacity*100)/100
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
                            x1: Math.round(p.x),
                            y1: Math.round(p.y),
                            x2: this.mouseParticle.x,
                            y2: this.mouseParticle.y,
                            opacity: Math.round(100*opacity)/100
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
        window.removeEventListener('mousemove', this.mousemoveHandler);
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
