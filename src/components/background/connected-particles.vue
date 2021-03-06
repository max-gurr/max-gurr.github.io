<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas connected-particles-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <defs>
            <radialGradient id="gradientFill">
                <stop offset="25%" stop-color="rgba(255, 255, 255, 0.3)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
            <radialGradient id="mouseParticleFill">
                <stop offset="25%" stop-color="rgba(255, 255, 255, 0.5)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
        </defs>
        <circle v-if="mouseParticle" :cx="mouseParticle.x" :cy="mouseParticle.y" :r="mouseParticle.radius" fill="url(#mouseParticleFill)" id="mouse-particle"/>
        <circle v-for="(p, index) in particles" :key="'particle-'+index" :cx="p.x" :cy="p.y" :r="radius" fill="url(#gradientFill)" class="particle" />
        <line v-for="(l, index) in lines" :key="'line-'+index" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" stroke="white" :opacity="l.opacity"/>
    </svg>
</template>

<script>
export default {
    name: 'connected-particles',
    props: {
        num: {
            type: Number,
            default: 80
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
        lineRange: 100,
        maxOpacity: 0.25
    }),
    created() {
        this.drawCycle = setInterval(async function() {
            await Promise.all(this.particles.map(async (p) => {
                this.updateParticle(p, this.lineRange);          
            }));

            if (this.mouseParticle.nextX !== 0) {
                this.mouseParticle.x = this.mouseParticle.nextX;
                this.mouseParticle.y = this.mouseParticle.nextY;
            }

            this.lines = await this.makeLines(this.lineRange);
        }.bind(this), 40);
    },
    mounted() {
        this.lineRange = this.calculateLineRange();

        window.addEventListener('resize', this.resizeHandler((e) => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.lineRange = this.calculateLineRange();
            this.particles = this.makeParticles();
        }));

        window.addEventListener('mousemove', (e) => {
            if (this.mouseParticle) {
                this.mouseParticle.nextX = e.clientX;
                this.mouseParticle.nextY = e.clientY;
            }
        });

        this.particles = this.makeParticles();
        this.mouseParticle = {
            x: -10,
            y: -10,
            radius: this.radius*2,
            nextX: 0,
            nextY: 0
        }
    },
    methods: {
        resizeHandler (func) {
            let timer;
            return (event) => {
                if(timer) clearTimeout(timer);
                timer = setTimeout(func,500,event);
            };
        },
        calculateLineRange () {
            const divider = 10;
            let range = Math.max(this.width/divider, this.height/divider);

            return Math.max(this.lineRange, range);
        },
        makeParticles () {
            let particles = [];

            const responsiveNum = this.width/15 + this.height/15;
            const numParticles = Math.min(this.num, responsiveNum);
            
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
                });
            }

            return particles;
        },
        async updateParticle (p, range) {
            p.x += p.xVel;
            p.y += p.yVel;

            if (p.x < -range) {
                p.x += this.width + 2 * range;
            } else if (p.x > this.width + range) {
                p.x -= (this.width + 2 * range);
            }

            if (p.y < -range) {
                p.y += this.height + 2 * range;
            } else if (p.y > this.height + range) {
                p.y -= (this.height + 2 * range);
            }
        },
        async makeLines (range) {
            const lines = [];
            const squareRange = range * range;
            const particles = [...this.particles, this.mouseParticle];

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i+1; j < particles.length; j++) {
                    const p2 = particles[j];

                    const xDist = p1.x - p2.x;
                    const yDist = p1.y - p2.y;
                    const squareDist = xDist * xDist + yDist * yDist;

                    if (squareDist < squareRange) {
                        const opacity = this.maxOpacity * 1.5 * (squareRange - squareDist)/squareRange;
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

            return lines;
        }
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
    }
}
</script>

<style scoped lang="scss">
@import '../../assets/variables.scss';

.connected-particles-canvas {
    background-color: $bg-dark-blue;
}
</style>
