<template>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" id="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
      <circle v-for="(p, index) in particles" :key="'particle-'+index" :cx="p.x" :cy="p.y" :r="radius" fill="white" opacity="0.5"/>
      <line v-for="(l, index) in lines" :key="'line-'+index" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" stroke="white" :opacity="l.opacity"/>
  </svg>
</template>

<script>
export default {
    name: 'particles',
    props: {
        num: {
            type: Number,
            default: 150
        },
        radius: {
            type: Number,
            default: 3
        }
    },
    data: () => ({
        particles: [],
        lines: [],
        width: window.innerWidth,
        height: window.innerHeight,
        lineRange: 0,
        drawCycle: null
    }),
    mounted() {
        this.lineRange = this.calculateLineRange(this.width, this.height);

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.lineRange = this.calculateLineRange(this.width, this.height);
        });

        this.makeParticles(this.particles, this.num, this.width, this.height);

        this.drawCycle = setInterval(async function() {
            await Promise.all(this.particles.map(async (p) => {
                this.updateParticle(p, this.width, this.height, this.lineRange);          
            }));

            this.lines = [];
            await this.makeLines(this.particles, this.lines, this.lineRange);
        }.bind(this), 40);
    },
    methods: {
        calculateLineRange: (width, height) => {
            const divider = 7;
            return Math.min(width/divider, height/divider);
        },
        makeParticles: (particles, num, width, height) => {
            for (let i = 0; i < num; i++) {
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);
                const mag = Math.sqrt(xVel * xVel + yVel * yVel);

                if (mag == 0) {
                    xVel = 1;
                    yVel = 1;
                }

                const scale = 0.75;
                xVel = scale * (xVel/mag);
                yVel = scale * (yVel/mag);

                particles.push({
                    x: Math.random()*width,
                    y: Math.random()*height,
                    xVel: xVel,
                    yVel: yVel,
                });
            }
        },
        updateParticle: async (p, width, height, range) => {
            p.x += p.xVel;
            p.y += p.yVel;

            if (p.x < -range) {
                p.x += width + 2 * range;
            } else if (p.x > width + range) {
                p.x -= (width + 2 * range);
            }

            if (p.y < -range) {
                p.y += height + 2 * range;
            } else if (p.y > height + range) {
                p.y -= (height + 2 * range);
            }
        },
        makeLines: async (particles, lines, range) => {
            const squareRange = range * range;

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i+1; j < particles.length; j++) {
                    const p2 = particles[j];

                    const xDist = p1.x - p2.x;
                    const yDist = p1.y - p2.y;
                    const squareDist = xDist * xDist + yDist * yDist;

                    if (squareDist < squareRange) {
                        const opacity = 0.6 * (squareRange - squareDist)/squareRange;
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
    #canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        background-color: rgb(38, 38, 77);
    }

    .particle {
        min-width: 100px;
        min-height: 100px;
        background-color: green;
    }
</style>
