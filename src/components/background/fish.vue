<template>
    <div class="canvas" id="root">
        <div class="canvas fish-canvas" ref="canvasContainer">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
                <defs>
                    <filter id="turbulence" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence id="sea-filter" numOctaves="2" baseFrequency="0.02 0.02"></feTurbulence>
                        <feDisplacementMap scale="20" in="SourceGraphic"></feDisplacementMap>
                        <feGaussianBlur in="feDisplacementMap" stdDeviation="2" />
                    </filter>
                    <!-- <animate xlink:href="#sea-filter" attributeName="baseFrequency" dur="60s" keyTimes="0;0.5;1" values="0.02 0.06;0.04 0.08;0.02 0.06" repeatCount="indefinite"/> -->
                </defs>

                <g id="fish-container">
                    <g v-for="(f, index) in fish" :key="'fish-'+index" :opacity="fishOpacity" :transform="'rotate('+f.rotation+', '+f.x+', '+f.y+')'">
                        <!-- Fish -->
                        
                        <path :d="
                            'M ' +f.x+ ' ' +(f.y-fishSizeRadius)+
                            ' q '+fishSizeRadius*1.5+' '+fishSizeRadius+' -'+fishSizeRadius+' '+fishSizeRadius*3+
                            'q '+fishSizeRadius+' -'+fishSizeRadius/2+' '+fishSizeRadius*2+' 0'+
                            ' q -'+fishSizeRadius*2.5+' -'+fishSizeRadius+' -'+fishSizeRadius+' -'+fishSizeRadius*3+' Z'"
                        :fill="'rgb('+(50 + 80*(f.xVel+f.yVel))+', '+(255*f.x/width)+', '+(255*(f.y/height))+')'"
                         />
                         <path :d="
                            'M '+(f.x-fishSizeRadius)+' '+(f.y+3)+
                            ' q '+fishSizeRadius+' -'+fishSizeRadius+' '+(fishSizeRadius*2)+' 0 Z'
                         " 
                         :fill="'rgb('+(50 + 80*(f.xVel+f.yVel))+', '+(255*f.x/width)+', '+(255*(f.y/height))+')'"
                         />
                        
                        <!-- Arrowhead -->
                        <!-- <path :d="
                            'M ' + (f.x) + ' ' + (f.y-fishSizeRadius)+
                            ' l -'+fishSizeRadius/2+' '+fishSizeRadius*1.25+
                            ' q '+fishSizeRadius/2+' -'+fishSizeRadius/2+' '+fishSizeRadius+' 0 Z'" 
                        :fill="'rgb('+(50 + 80*(f.xVel+f.yVel))+', '+(255*f.x/width)+', '+(255*(f.y/height))+')'"
                        :transform="'rotate('+f.rotation+', '+f.x+', '+f.y+')'" /> -->
                        
                        <!-- Outlines of neighbour/separation radius -->
                        <!-- <circle :cx="f.x" :cy="f.y" :r="fishSizeRadius*4" stroke="rgba(150, 0, 0, 0.6)" stroke-width="10" fill="none" />
                        <circle :cx="f.x" :cy="f.y" :r="neighbourRadius" stroke="rgba(0, 150, 0, 0.6)" stroke-width="10" fill="none" /> -->
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script>
export default {
    name: 'fish',
    props: {
        fishSizeRadius: {
            type: Number,
            default: 11
        },
        neighbourRadius: {
            type: Number,
            default: 180
        },
        mouseEffectRadius: {
            type: Number,
            default: 150
        }
    },
    data: () => ({
        fish: [],
        ripples: [],
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        fishOpacity: 0.3,
        maxVel: 3,
        maxForce: 0.03,
        cohesionScale: 2,
        alignmentScale: 0.6,
        separationScale: 12,
        fishColour: 'rgb(255, 100, 100)',
        frameRate: 35,
        numFish: 20,
        rainChance: 0.25,
        rippleGap: 0.2,
        mousePos: null,
        squareMouseEffectRadius: 0
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('click', this.clickHandler);
        window.addEventListener('mousemove', this.mousemoveHandler);
    },
    mounted() {
        this.resizeHandler();

        // Start animation
        // window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.frameRate);
        this.drawCycle = setInterval(this.draw.bind(this), this.frameRate);
    },
    methods: {
        async draw() {
            // Update fish
            await this.applyFlockingBehaviour();
            await Promise.all(this.fish.map(async (f) => {
                if (this.mousePos) {
                    await this.repelFromMouse(f);
                }
                this.updateFish(f, this.fishSizeRadius);          
            }));

            // Make ripples
            if (Math.random() < this.rainChance) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;

                this.makeRipple(x, y);
            }

            this.mousePos = null;
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const divider = 20;
            this.numFish = Math.round(Math.min(this.width/divider, this.height/divider)) || 25;

            this.squareMouseEffectRadius = this.mouseEffectRadius*this.mouseEffectRadius;
            this.makeFish();
        },
        async clickHandler(e) {        
            this.makeRipple(e.clientX, e.clientY);
        },
        async mousemoveHandler(e) {
            this.mousePos = {
                x: Math.round(e.clientX),
                y: Math.round(e.clientY),
            }
        },
        async makeFish() {
            this.fish = [];
            
            for (let i = 0; i < this.numFish; i++) {
                var xVel = Math.sin(Math.random()*360);
                var yVel = Math.sin(Math.random()*360);

                const mag = Math.sqrt(xVel * xVel + yVel * yVel);
                if (mag === 0) {
                    xVel = 0.5;
                    yVel = 0.5;
                }
                const scale = this.maxVel/mag;
                xVel = scale * xVel;
                yVel = scale * yVel;

                this.fish.push({
                    x: Math.random()*this.width,
                    y: Math.random()*this.height,
                    xVel: xVel,
                    yVel: yVel,
                    xAcc: 0,
                    yAcc: 0,
                    rotation: 0
                });
            }
        },
        async updateFish(f, range) {
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
            const velMag = Math.sqrt(f.xVel * f.xVel + f.yVel * f.yVel);
            if (velMag > 0) {
                f.xVel *= this.maxVel/velMag;
                f.yVel *= this.maxVel/velMag;
            }

            // Reset acc
            f.xAcc /= 2;
            f.yAcc /= 2;
        },
        async applyFlockingBehaviour() {
            // Go through each fish
            for (let i = 0; i < this.fish.length; i++) {
                const f1 = this.fish[i];
                let neighbourCount = 0;
                let separationCount = 0;
                let cohesionX = 0;
                let cohesionY = 0;
                let alignmentX = 0;
                let alignmentY = 0;
                let separationX = 0;
                let separationY = 0;

                // Go through each other fish
                for (let j = 0; j < this.fish.length; j++) {
                    if (i !== j) {
                        const f2 = this.fish[j];

                        // Calculate dist between fish
                        const xDist = f2.x - f1.x;
                        const yDist = f2.y - f1.y;
                        const mag = Math.sqrt(xDist * xDist + yDist * yDist);

                        // If distance is less than neighbour radius
                        // , f2 is a neighbour of f1
                        if (mag > 0 && mag < this.neighbourRadius) {
                            // Apply flocking forces from neighbours
                            alignmentX += f2.xVel;
                            alignmentY += f2.yVel;

                            // Cohesion //
                            cohesionX += f2.x;
                            cohesionY += f2.y;

                            // Separation
                            if (mag < this.fishSizeRadius * 4) {
                                const separationXDist = -xDist/mag;
                                const separationYDist = -yDist/mag;
                                separationX += separationXDist;
                                separationY += separationYDist;
                            
                                separationCount += 1;
                            }

                            neighbourCount += 1;
                        }
                    }
                }
                if (cohesionX !== 0 || cohesionY !== 0) {
                    cohesionX /= neighbourCount;
                    cohesionY /= neighbourCount;
                    this.applyCohesion(f1, cohesionX, cohesionY);
                }

                if (alignmentX !== 0 || alignmentY !== 0) {
                    alignmentX /= neighbourCount;
                    alignmentY /= neighbourCount;
                    this.applyAlignment(f1, alignmentX, alignmentY);
                }
                
                if (separationX !== 0 || separationY !== 0) {
                    separationX /= separationCount;
                    separationY /= separationCount;
                    this.applySeparation(f1, separationX, separationY);
                }
            }
        },
        async applyCohesion(f, cohesionX, cohesionY) {
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
        },
        async applySeparation(f, separationX, separationY) {
            // Force = different in velocity
            let xForce = separationX - f.xVel;
            let yForce = separationY - f.yVel;

            // Scale to max force
            const separationMag = Math.sqrt(xForce * xForce + yForce * yForce);
            if (separationMag > this.maxForce) {
                xForce = this.maxForce * xForce/separationMag;
                yForce = this.maxForce * yForce/separationMag;
            }

            // Adjust by behaviour multipler
            xForce *= this.separationScale;
            yForce *= this.separationScale;

            // Add to acc
            f.xAcc += xForce;
            f.yAcc += yForce;
        },
        async applyAlignment(f, alignmentX, alignmentY) {
            // Force = different in velocity
            let xForce = alignmentX - f.xVel;
            let yForce = alignmentY - f.yVel;

            // Scale to max force
            const alignmentMag = Math.sqrt(xForce * xForce + yForce * yForce);
            if (alignmentMag > this.maxForce) {
                xForce = this.maxForce * xForce/alignmentMag;
                yForce = this.maxForce * yForce/alignmentMag;
            }

            // Adjust by behaviour multipler
            xForce *= this.alignmentScale;
            yForce *= this.alignmentScale;

            // Add to acc
            f.xAcc += xForce;
            f.yAcc += yForce;
        },
        async makeRipple(x, y) {
            const canvas = this.$refs['canvasContainer'];

            const ripple = document.createElement("div");
            ripple.className = "ripple";
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            ripple.addEventListener( 'animationend', function() {
                canvas.removeChild(ripple);
            }.bind(this));

            canvas.appendChild(ripple);
        },
        async repelFromMouse(f) {
            const xDist = f.x - this.mousePos.x;
            const yDist = f.y - this.mousePos.y;

            const posSquare = xDist * xDist + yDist * yDist;
            if (posSquare < this.squareMouseEffectRadius) {
                const xVelDelta = xDist - f.xVel;
                const yVelDelta = yDist - f.yVel;

                const velMag = Math.sqrt(xVelDelta * xVelDelta + yVelDelta * yVelDelta);
                const maxMag = (this.mouseEffectRadius/velMag);
                
                const xForce = maxMag * (xVelDelta/velMag);
                const yForce = maxMag * (yVelDelta/velMag);

                f.xAcc += Math.min(xForce, this.maxForce);
                f.yAcc += Math.min(yForce, this.maxForce);
           }
        },
    },
    
    beforeDestroy() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('click', this.clickHandler);
        window.removeEventListener('mousemove', this.mousemoveHandler);
    }
}
</script>

<style lang="scss">
@import '../../assets/variables.scss';

#root {
    background: $bg-dark-blue;
    background: radial-gradient(circle, #051541 0%, $bg-dark-blue 100%);

    .fish-canvas {
        filter: url(#turbulence);

        .ripple {
            position: absolute;
            border-radius: 50%;
            animation: fish-ripple-animate 0.8s ease;
            transform: translate(-50%, -50%);
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 1);
        }

        @keyframes fish-ripple-animate {
            0% {
                opacity: 0.4;
                min-width: 0px;
                min-height: 0px;
            }
            100% {
                opacity: 0;
                min-width: 100px;
                min-height: 100px;
            }
        }
    }
}
</style>
