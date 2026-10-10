<template>
<div>
    <!-- Particles -->
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas constellations-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <!-- Moon -->
        <g>
            <radialGradient id='moon-fill'>
                <stop offset="0%" stop-color="transparent" />
                <stop offset="25%" stop-color="rgba(170, 180, 150, 0.15)" />
                <stop offset="45%" stop-color="transparent" />
                <stop offset="80%" :stop-color="'rgba(150, 180, 170, 0.2)'" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>
        
            <circle 
                :cx="width/2" 
                :cy="(height/1.5)" 
                :r="Math.max(width/2, height/2)" 
                fill="url(#moon-fill)" 
                stroke="none" 
            />
        </g>
        
        <!-- Page particles -->
        <g v-for="(p, index) in particles" :key="'particle-'+index" >
            <defs>
                <radialGradient :id="'gradientFill-'+index">
                    <stop offset="25%" :stop-color="'rgb('+(100 + 155*p.mouseDist)+', '+(100 + 155*Math.round(p.x)/width)+', '+(100 + 155*Math.round(p.y)/height)+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle 
                cx="0" 
                cy="0" 
                :r="radius" 
                :fill="'url(#gradientFill-'+index+')'" 
                :transform="'translate('+Math.round(p.x)+', '+Math.round(p.y)+')'"
                class="particle"
                :opacity="(maxOpacity+0.3*p.mouseDist)"
            />        
        </g>

        <!-- Mouse particle -->
        <g>
            <defs>
                <radialGradient id="mouseParticleFill">
                    <stop offset="25%" :stop-color="'rgba(255, 255, 255, '+maxOpacity*2+')'" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            <circle 
                v-if="mouseParticle" 
                :cx="mouseParticle.x" 
                :cy="mouseParticle.y" 
                :r="mouseParticle.radius" 
                fill="url(#mouseParticleFill)" id="mouse-particle" 
            />
        </g>

        <!-- Lines -->
        <!-- <g>
            <line 
                v-for="(l, index) in lines" 
                :key="'line-'+index" 
                :x1="l.x1" 
                :y1="l.y1" 
                :x2="l.x2" 
                :y2="l.y2" 
                stroke="white"
                :opacity="l.opacity" 
            />
        </g> -->
        <path 
            v-for="(linePath, opacity) in lines" 
            :key="'lines-'+opacity" 
            :d="linePath" 
            stroke="white"
            :opacity="opacity" 
        />
    </svg>
    <div class="canvas star-canvas" ref="star-canvas"></div>
    <!-- Mountains -->
    <svg viewBox="0 0 100 100" class="canvas" x="0" :width="width" :height="height/2" preserveAspectRatio="xMinYMax meet">
        <path d="
            M 0 100
            l 0 -20
            l 10 -10
            l 5 -3
            l 3 -5
            l 4 -3
            l 3 -4
            l 5 2
            l 2 -2
            l 3 -1
            l 2 -4
            l 4 -3
            l 4 2
            l 3 3
            l 4 1
            l 2 5
            l 5 5
            l 3 5
            l 5 3
            l 4 2
            l 2 4
            l 6 3
            l 4 5
            l 2 4
            l 3 5
            l 5 2
            L 100 100 Z
        " 
        fill="rgb(2, 2, 5)" 
        stroke="none" 
        stroke-linejoin="round" />
    </svg>
    <svg viewBox="0 0 100 100" class="canvas" x="0" :width="width" :height="height/2" preserveAspectRatio="xMaxYMax meet">
        <path d="
            M 100 100
            l 0 -30
            l -4 -4
            l -5 -3
            l -3 -5
            l -2 1
            l -2 -4
            l -3 -3
            l -5 -3
            l -3 -3
            l -2 -2
            l -2 1
            l -2 2
            l -2 4
            l -3 4
            l -3 1
            l -3 3
            l -2 4
            l -4 2
            l -3 4
            l -4 1
            l -4 3
            l -5 3
            l -5 6
            l -4 3
            l -5 3
            l -3 5
            l -4 2
            l -5 3
            l -2 4
            L 0 100 Z
        " 
        fill="rgb(2, 2, 5)" 
        stroke="none" 
        stroke-linejoin="round" />
    </svg>
    <svg viewBox="0 0 100 100" class="canvas" x="0" :width="width" :height="height/2" preserveAspectRatio="xMidYMax meet">
        <path d="
            M 25 100
            l 4 -2
            l 2 -4
            l 5 -3
            l 2 -3
            l 3 -2
            l 3 -5
            l 2 2
            l 1 -1
            l 2 -4
            l 3 -2
            l 3 3
            l 4 2
            l 2 4
            l 5 5
            l 3 5
            l 4 3
            L 80 100 Z
        " 
        fill="rgb(2, 2, 5)" 
        stroke="none" 
        stroke-linejoin="round" />
    </svg>
</div>
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
            default: 180
        },
        radius: {
            type: Number,
            default: 5
        },
        maxLineRange: {
            type: Number,
            default: 150
        }
    },
    data: () => ({
        particles: [],
        mouseParticle: null,
        lines: {},
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        shootingStarChance: 0.02,
        lineRange: 0,
        maxOpacity: 0.3,
        animationRate: 40,
        numParticlesDivider: 10000,
        lineOpacityDivider: 0.03,
        lineRangeDivider: 4.5
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
            await Promise.all(this.particles.map(async (p) => {
                this.updateParticle(p, this.lineRange);          
            }));

            if (this.mouseParticle && this.mouseParticle.nextX !== 0) {
                this.mouseParticle.x = this.mouseParticle.nextX;
                this.mouseParticle.y = this.mouseParticle.nextY;
            }

            this.lines = await this.makeLines(this.lineRange);

            if (Math.random() < this.shootingStarChance) {
                this.makeShootingStar();
            }
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
            let range = Math.min(this.width/this.lineRangeDivider, this.height/this.lineRangeDivider);
            this.lineRange = Math.max(this.maxLineRange/2, Math.min(this.maxLineRange, range));
        },
        async makeParticles() {
            const particles = [];
            const responsiveNum = (this.width * this.height)/this.numParticlesDivider;
            const numParticles = Math.max(this.minNumParticles, Math.min(this.maxNumParticles, responsiveNum));
            
            for (let i = 0; i < numParticles; i++) {
                const xPos = Math.random()*this.width;
                const yPos = Math.random()*this.height;
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);

                if (xVel === 0 && yVel === 0) {
                    xVel = 1;
                    yVel = -0.6;
                }

                const scale = 0.5;
                const mag = Math.sqrt(xVel * xVel + yVel * yVel);
                xVel *= scale/mag;
                yVel *= scale/mag;

                particles.push({
                    x: xPos,
                    y: yPos,
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
        async makeLines (range) {
            const lineData = this.getEmptyLines();

            await this.computeLines(lineData, range);
            if (this.mouseParticle) {
                await this.makeLinesToMouse(lineData, range);
            }

            const linePaths = await this.makeLinePaths(lineData)

            console.log(linePaths);

            return linePaths;
        },
        getEmptyLines() {
            const lines = {};
            for (let i = this.lineOpacityDivider; i <= this.maxOpacity + this.lineOpacityDivider; i += this.lineOpacityDivider) {
                let index = Math.round(i * 1000)/1000;
                lines[index] = [];
            }

            return lines;
        },
        addNewLine(lines, p1, p2, opacity) {
            const roundedOpacity = Math.round((opacity - (opacity % this.lineOpacityDivider))*1000)/1000;
            
            // Don't want lines with opacity 0
            if (roundedOpacity > 0) {
                lines[roundedOpacity].push({
                    x1: Math.round(p1.x),
                    y1: Math.round(p1.y),
                    x2: Math.round(p2.x),
                    y2: Math.round(p2.y),
                });
            }
        },
        async computeLines(lines, range) {
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
                        // Set opacity based on distance
                        let opacity = this.maxOpacity * (squareRange - squareDist)/squareRange;
                        // Round based on opacity divider
                        
                        this.addNewLine(lines, p1, p2, opacity);
                    }
                }
            }
        },
        async makeLinesToMouse(lines, range) {
            const squareRange = range * range;
            // Mouse lines
            this.particles.forEach((p) => {
                const xDist = this.mouseParticle.x - p.x;
                const yDist = this.mouseParticle.y - p.y;
                const squareDist = xDist * xDist + yDist * yDist;

                if (squareDist < squareRange) {
                    const opacity = this.maxOpacity * (squareRange - squareDist)/squareRange;
                    this.addNewLine(lines, p, this.mouseParticle, opacity);

                    p.mouseDist = 1 - squareDist/squareRange;
                } else {
                    p.mouseDist = 0;
                }
            })
        },
        async makeLinePaths(lineData) {
            const linePaths = {};
            for (const opacity in lineData) {
                const lines = lineData[opacity];
                let newLinePath = "";
                lines.forEach((l) => {
                    newLinePath += `M ${l.x1} ${l.y1} L ${l.x2} ${l.y2} `
                });

                linePaths[opacity] = newLinePath;
            }

            return linePaths;
        },
        makeShootingStar() {
            const canvas = this.$refs['star-canvas'];
            const x = Math.random() * this.width;
            const y = Math.random() * this.height/2;

            const angleRange = 160;
            const rotation = Math.round(Math.random() * angleRange - angleRange/2);

            const shootingStar = document.createElement("div");
            shootingStar.className = "shooting-star";
            shootingStar.style.left = x + 'px';
            shootingStar.style.top = y + 'px';
            shootingStar.style.transform = 'rotate('+rotation+'deg)';

            shootingStar.addEventListener( 'animationend', function() {
                canvas.removeChild(shootingStar);
            }.bind(this));

            canvas.appendChild(shootingStar);
        }
    },
    beforeUnmount() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('mousemove', this.mousemoveHandler);
    }
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

.constellations-canvas {
    background: $bg-dark-blue;
    background: radial-gradient(circle, rgba(18,12,35,1) 0%, $bg-dark-blue 100%);
}

.star-canvas {
    .shooting-star {
        position: absolute;
        width: 5px;
        height: 20vh;
        border-radius: 99px;
        overflow: hidden;

        &::after {
            background-color: rgba(255, 255, 255, 0.2);
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            animation: shooting-star 0.5s ease;
        }
    }

    @keyframes shooting-star {
        0% {
            transform: translateY(-100%);
        }
        100% {
            transform: translateY(100%);
        }
    }
}
</style>
