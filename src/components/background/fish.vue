<template>
    <div class="canvas" id="root">
        <div class="canvas fish-canvas" ref="ripple-container"></div>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
            <defs>
                <filter id="turbulence" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence id="sea-filter" baseFrequency="0.02 0.02"></feTurbulence>
                    <feDisplacementMap scale="12" in="SourceGraphic"></feDisplacementMap>
                    <feGaussianBlur in="feDisplacementMap" stdDeviation="1.8" />
                </filter>
                <!-- <animate xlink:href="#sea-filter" attributeName="baseFrequency" dur="60s" keyTimes="0;0.5;1" values="0.02 0.06;0.04 0.08;0.02 0.06" repeatCount="indefinite"/> -->
            </defs>

            <g id="fish-container" filter="url(#turbulence)">
                <g v-for="(f, index) in fish" 
                    :key="'fish-'+index" 
                    :opacity="fishOpacity" 
                    :transform="'rotate('+f.rotation+', '+(f.x+fishSizeRadius)+', '+(f.y)+')'" 
                    :fill="f.colour" 
                    stroke="none">
                    <!-- Fish path -->
                    <path :d="
                        'M '+(f.x)+' '+(f.y-fishSizeRadius)+
                        'q '+(fishSizeRadius)+' '+(fishSizeRadius)+' -'+(fishSizeRadius/2)+' '+(fishSizeRadius*2)+
                        'q '+(fishSizeRadius/2)+' -'+(fishSizeRadius/3)+' '+(fishSizeRadius)+' 0'+
                        'q -'+(fishSizeRadius*1.5)+' -'+(fishSizeRadius)+' -'+(fishSizeRadius/2)+' -'+(fishSizeRadius*2)"
                    />
                    <path :d="
                        'M '+(f.x-fishSizeRadius/1.8)+' '+(f.y)+
                        'q '+(fishSizeRadius/1.8)+' -'+(fishSizeRadius)+' '+(2*fishSizeRadius/1.8)+' 0 Z'"
                    />
                </g>
            </g>
        </svg>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
            <defs>
                <svg id="lily-pad" viewBox="0 0 100 100" >
                    <path d="
                        M 0 40 
                        a 50 50 0 1 1 0 20 
                        L 50 50 z" />
                </svg>
                <svg id="lily-flower" viewBox="0 0 100 100" >
                    <circle cx="50" cy="50" r="5" fill="rgb(100, 100, 40)" />
                    <g v-for="p1 in 12" :key="'outerpetal-'+p1">
                        <ellipse cx="50" cy="30" rx="6" ry="15" fill="rgb(100, 100, 100)" :transform="'rotate('+(p1*30)+' 50 50)'"/>
                    </g>
                    <g v-for="p2 in 12" :key="'middlepetal-'+p2">
                        <ellipse cx="50" cy="35" rx="4" ry="10" fill="rgb(100, 90, 90)" :transform="'rotate('+(p2*30 + 15)+' 50 50)'"/>
                    </g>
                    <g v-for="p3 in 8" :key="'flower-'+p3">
                        <ellipse cx="50" cy="40" rx="3" ry="8" fill="rgb(80, 20, 60)" :transform="'rotate('+(p3*45 + 15)+' 50 50)'"/>
                    </g>
                </svg>
            </defs>

            <!-- Lily pads -->
            <g 
                v-for="(pad, padIndex) in lilypads"
                :key="'lilpad-'+padIndex"
                :transform="'rotate('+pad.rotation+' '+(pad.x + pad.size/2)+' '+(pad.y + pad.size/2)+')'"
            >
                <use
                    xlink:href="#lily-pad" 
                    :fill="pad.fill"
                    :x="pad.x" 
                    :y="pad.y" 
                    :width="pad.size" 
                    :height="pad.size"
                />
                <use
                    v-if="pad.flower"
                    xlink:href="#lily-flower" 
                    :x="pad.x" 
                    :y="pad.y" 
                    :width="pad.size" 
                    :height="pad.size"
                />
            </g>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'fish',
    props: {
        fishSizeRadius: {
            type: Number,
            default: 13
        },
        neighbourRadius: {
            type: Number,
            default: 150
        },
        mouseEffectRadius: {
            type: Number,
            default: 200
        },
        maxFish: {
            type: Number,
            default: 40
        },
        numLilypads: {
            type: Number,
            default: 12
        },
        lilypadChance: {
            type: Number,
            default: 0.15
        }
    },
    data: () => ({
        fish: [],
        ripples: [],
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        fishOpacity: 0.3,
        maxVel: 2.35,
        maxForce: 0.01,
        cohesionScale: 3,
        alignmentScale: 0.6,
        separationScale: 10,
        fishColour: 'rgb(255, 100, 100)',
        frameRate: 40,
        numFish: 0,
        rainChance: 0.15,
        rippleGap: 0.2,
        mousePos: null,
        squareMouseEffectRadius: 0,
        lilypads: [],
        lilypadSize: 0
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('click', this.clickHandler);
        window.addEventListener('mousemove', this.mousemoveHandler);
    },
    mounted() {
        this.resizeHandler();

        // Start animation
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
                this.updateFish(f);          
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

            const fishDivider = 18;
            this.numFish = Math.round(Math.min(this.maxFish, Math.min(this.width/fishDivider, this.height/fishDivider)));

            this.squareMouseEffectRadius = this.mouseEffectRadius*this.mouseEffectRadius;
            this.makeFish();

            const lilypadDivider = 8;
            this.lilypadSize = Math.min(this.width/lilypadDivider, this.height/lilypadDivider);
            this.lilypads = [];
            this.makeLilypads(this.numLilypads);
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
                    rotation: 0,
                    colour: 'white'
                });
            }
        },
        async makeLilypads(num) {
            for (let i = 0; i < num; i++) {
                const xRange = this.width - this.lilypadSize*2;
                const yRange = this.height - this.lilypadSize*2;
                const xPos = Math.round(Math.random() * xRange + this.lilypadSize);
                const yPos = Math.round(Math.random() * yRange + this.lilypadSize);

                const sizeRange = this.lilypadSize/4;
                const size = Math.round((Math.random()*2 - 1)*sizeRange + this.lilypadSize);
                
                const rotation = Math.round(Math.random() * 365);

                const green = Math.round(Math.random() * 10 + 15);
                const blue = Math.round(Math.random() * 10 + 12);
                const fill = 'rgb(0, '+green+', '+blue+')';

                const flower = Math.random() < this.lilypadChance;

                const newLilypad = {
                    x: xPos,
                    y: yPos,
                    size: size,
                    rotation: rotation,
                    fill: fill,
                    flower: flower
                };

                let goodPad = false;
                while (!goodPad) {
                    goodPad = true;
                    
                    // Check if lilypad is touching any others
                    for (let p = 0; p < this.lilypads.length; p++) {
                        const otherPad = this.lilypads[p];
                        if (this.lilypadsTouching(newLilypad, otherPad)) {
                            goodPad = false;
                        }
                    }

                    if (!goodPad) {
                        newLilypad.x = Math.round(Math.random() * xRange + this.lilypadSize);
                        newLilypad.y = Math.round(Math.random() * yRange + this.lilypadSize);
                    }
                }

                this.lilypads.push(newLilypad);
            }
        },
        lilypadsTouching(l1, l2) {
            const xPos1 = l1.x + l1.size/2;
            const xPos2 = l2.x + l2.size/2;
            const yPos1 = l1.y + l1.size/2;
            const yPos2 = l2.y + l2.size/2;

            const xDist = xPos2 - xPos1;
            const yDist = yPos2 - yPos1;
            const squareDist = xDist*xDist + yDist*yDist;
            
            const range = l1.size/2 + l2.size/2;
            const squareRange = range * range;

            return (squareDist < squareRange);
        },
        async updateFish(f) {
            const range = this.fishSizeRadius*2;
            
            // Add acc to vel
            f.xVel += f.xAcc;
            f.yVel += f.yAcc;
            
            // Add vel to pos
            f.x += f.xVel;
            f.y += f.yVel;

            // Check if at left/right border
            if (f.x < -range) {
                f.x += this.width + range*2;
            } else if (f.x > this.width + range) {
                f.x -= (this.width + range*2);
            }
            // Check if at top/bottom border
            if (f.y < -range) {
                f.y += this.height + range*2;
            } else if (f.y > this.height + range) {
                f.y -= (this.height + range*2);
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

            // Calculate colour
            f.colour = 'rgb('+(50 + 80*(f.xVel+f.yVel))+', '+(255*f.x/this.width)+', '+(255*(f.y/this.height))+')';
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
            const canvas = this.$refs['ripple-container'];

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
                const maxMag = 1 - (velMag/this.mouseEffectRadius);
                
                const xForce = maxMag * (xVelDelta/velMag);
                const yForce = maxMag * (yVelDelta/velMag);

                f.xAcc += xForce;
                f.yAcc += yForce;
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
    background: radial-gradient(circle, #01212b 0%, $bg-dark-blue 100%);

    .fish-canvas {
        .ripple {
            position: absolute;
            border-radius: 50%;
            animation: fish-ripple-animate 0.8s ease;
            transform: translate(-50%, -50%);
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 1),
                        inset 0px 0px 10px rgba(255, 255, 255, 1);
        }

        @keyframes fish-ripple-animate {
            0% {
                opacity: 0.2;
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
