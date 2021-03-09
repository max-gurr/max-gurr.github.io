<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas fish-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <filter id="blurFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
        
        <g v-for="(f, index) in fish" :key="'fish-'+index" :opacity="fishOpacity" filter="url(#blurFilter)">
            <!-- Triangle shape path -->
            <path :d="
                'M ' + (f.x) + ' ' + (f.y-fishSize)+
                ' l -'+fishSize/2+' '+fishSize*1.25+
                ' q '+fishSize/2+' -'+fishSize/2+' '+fishSize+' 0 Z'" 
            :fill="fishColour"
            :transform="'rotate('+f.rotation+', '+f.x+', '+f.y+')'" />
        </g>
    </svg>
</template>

<script>
export default {
    name: 'fish',
    props: {
        numFish: {
            type: Number,
            default: 20
        },
        fishSize: {
            type: Number,
            default: 15
        },
        neighbourRadius: {
            type: Number,
            default: 100
        }
    },
    data: () => ({
        fish: [],
        width: window.innerWidth,
        height: window.innerHeight,
        fishOpacity: 0.3,
        maxVel: 2,
        maxForce: 0.6,
        cohesionScale: 1,
        alignmentScale: 1,
        separationScale: 1,
        fishColour: 'rgb(255, 100, 100)',
        animationFrequency: 50,
        squareNeighbourRadius: 0
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('click', this.clickHandler);
    },
    mounted() {
        this.makeFish();
        this.squareNeighbourRadius = this.neighbourRadius * this.neighbourRadius;

        // Start animation
        window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.animationFrequency);
    },
    methods: {
        async draw() {
            await this.partitionFish();
            await Promise.all(this.fish.map(async (f) => {
                this.updateFish(f, this.fishSize);          
            }));

            window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.animationFrequency);
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        },
        async clickHandler(e) {
           
        },
        async makeFish() {
            const fish = [];
            
            for (let i = 0; i < this.numFish; i++) {
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);
                const mag = Math.sqrt(xVel * xVel + yVel * yVel);

                if (mag === 0) {
                    xVel = 0.5;
                    yVel = 0.5;
                }

                xVel = this.maxVel * (xVel/mag);
                yVel = this.maxVel * (yVel/mag);

                fish.push({
                    x: Math.random()*this.width,
                    y: Math.random()*this.height,
                    xVel: xVel,
                    yVel: yVel,
                    xAcc: 0,
                    yAcc: 0,
                    rotation: 0,
                    neighbours: []
                });
            }

            this.fish = fish;
        },
        async updateFish(f, range) {
            // Apply flocking forces from neighbours
            if (f.neighbours.length > 0) {
                let cohesionX = 0;
                let cohesionY = 0;
                f.neighbours.forEach((n) => {
                    // Alignment

                    // Cohesion
                    cohesionX += n.x;
                    cohesionY += n.y;

                    // Separation
                });
                // Cohesion //
                // Scale to avg measurement
                cohesionX /= f.neighbours.length;
                cohesionY /= f.neighbours.length;

                // Desired velocity
                const cohesionXDist = cohesionX - f.x;
                const cohesionYDist = cohesionY - f.y;
                // Force to get to desired velocity
                let cohesionXForce = cohesionXDist - f.xVel;
                let cohesionYForce = cohesionYDist - f.yVel;

                // Scale to max force
                const cohesionMag = Math.sqrt(cohesionXForce * cohesionXForce + cohesionYForce * cohesionYForce);
                if (cohesionMag > this.maxForce) {
                    cohesionXForce = this.maxForce * cohesionXForce/cohesionMag;
                    cohesionYForce = this.maxForce * cohesionYForce/cohesionMag;
                }

                // Scale by behaviour multiplier
                cohesionXForce *= this.cohesionScale;
                cohesionYForce *= this.cohesionScale;

                // Add to acceleration
                f.xAcc += cohesionXForce;
                f.yAcc += cohesionYForce;

                console.log(cohesionXForce, cohesionYForce);
                // End of cohesion //

                // Separation //

                // End of separation //

                // Alignment //

                // End of alignment //
            }

            // Add acc to vel
            f.xVel += f.xAcc;
            f.yVel += f.yAcc;

            // Add vel to pos
            f.x += f.xVel;
            f.y += f.yVel;

            // Check if at left/right border
            if (f.x < -range/2) {
                f.x += this.width + range;
            } else if (f.x > this.width + range/2) {
                f.x -= (this.width + range);
            }
            // Check if at top/bottom border
            if (f.y < -range/2) {
                f.y += this.height + range;
            } else if (f.y > this.height + range/2) {
                f.y -= (this.height + range);
            }

            // Calculate rotation
            f.rotation = (Math.atan2(f.yVel, f.xVel)/Math.PI) * 180 + 90;

            // Scale velocity to maxVel
            const velMag = f.xVel * f.xVel + f.yVel * f.yVel;
            if (velMag !== 0) {
                f.xVel = this.maxVel * f.xVel/velMag;
                f.yVel = this.maxVel * f.yVel/velMag;
            }

            // Reset acc
            f.xAcc /= 2;
            f.yAcc /= 2;
        },
        async partitionFish() {
            // Go through each fish
            for (let i = 0; i < this.fish.length; i++) {
                const f1 = this.fish[i];
                const newNeighbours = [];

                // Go through each other fish
                for (let j = i+1; j < this.fish.length; j++) {
                    const f2 = this.fish[j];

                    // Calculate dist between fish
                    const xDist = f1.x - f2.x;
                    const yDist = f1.y - f2.y;
                    const squareMag = xDist * xDist + yDist * yDist;

                    // If distance is less than neighbour radius
                    // , f2 is a neighbour of f1
                    if (squareMag < this.squareNeighbourRadius) {
                        newNeighbours.push(f2);
                    }
                }

                // Assign new neighbours to f1
                f1.neighbours = newNeighbours;
            }
        }
    },
    beforeDestroy() {
       window.removeEventListener('resize', this.resizeHandler);
       window.removeEventListener('click', this.mouseMoveHandler);
    }
}
</script>

<style scoped lang="scss">
@import '../../assets/variables.scss';

.fish-canvas {
    background: $bg-dark-blue+10;
}
</style>
