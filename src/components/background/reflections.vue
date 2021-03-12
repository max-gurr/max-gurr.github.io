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
            <clipPath id="reflection-filter">
                <rect x="0" :y="height*cutoff" :width="width" :height="height*(1-cutoff)" />
            </clipPath>
            
            <filter id="reflection-blur" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence id="sea-filter" baseFrequency="0.01 0.03"></feTurbulence>
                <feDisplacementMap scale="50" in="SourceGraphic"></feDisplacementMap>
                <feGaussianBlur in="feDisplacementMap" stdDeviation="3" />
            </filter>


            <radialGradient id="flyer-fill">
                <stop offset="25%" stop-color="rgba(200, 150, 90, 0.8)" />
                <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <!-- Canvas -->
            <g id="canvas" ref="svg-canvas" clip-path="url(#clip)">
                <!-- Moon -->
                <circle :cx="width/2" :cy="height/3" :r="Math.min(width/3, height/3)" fill="url(#f1)" />
                
                <!-- Particles -->
                <g v-for="(s, starIndex) in stars" :key="'star-'+starIndex">
                    <radialGradient :id="'gradient-'+starIndex">
                        <stop offset="25%" :stop-color="'rgba('+(50*(s.xVel+s.yVel))+', '+(100 + 155*s.x/width)+', '+(100 + 155*s.y/height)+', '+(maxOpacity)+')'" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                    <circle :cx="s.x" :cy="s.y" :r="starSize" :fill="'url(#gradient-'+starIndex+')'" />
                </g>

                <!-- Mountains -->
                <path :d="
                'M 0 '+(height)+
                'V 0 '+(height*cutoff-80)+
                ' l '+(width/4)+' -'+(width/6)+
                'l '+(width/2)+' '+(width/4)+' z'"
                fill="black" stroke="black" 
                stroke-linecap="round" 
                stroke-linejoin="round" />
                <path :d="
                'M '+(width)+' '+(height)+
                'V 0 '+(height*cutoff-50)+
                ' l -'+(width/4)+' -'+(width/5)+
                'l -'+(width/1.5)+' '+(width/2)+' z'"
                fill="black" stroke="black" 
                stroke-linecap="round" 
                stroke-linejoin="round" />
                
            </g>
        </defs>
        
        <!-- Main display -->
        <use xlink:href="#canvas" />
        <!-- Reflected display -->
        <g clip-path="url(#reflection-filter)">
            <use xlink:href="#canvas" :transform="'translate(0, '+(height+2)+') scale(1, -'+((1-cutoff)/cutoff)+')'" filter="url(#reflection-blur)" />
        </g>
        <!-- Floaters -->
        <!-- <g>
            <circle v-for="(f, flyerIndex) in flyers" 
                :key="'flyer-'+flyerIndex"
                :cx="f.x"
                :cy="f.y"
                :r="maxFlyerRadius*(f.depth/2 + 0.5)" 
                fill="url(#flyer-fill)"/>
        </g> -->
    </svg>
</template>

<script>
export default {
    name: 'reflections',
    props: {
        cutoff: {
            type: Number,
            default: 0.6
        },
        starSize: {
            type: Number,
            default: 10
        },
        maxStars: {
            type: Number,
            default: 50
        },
        maxFlyerRadius: {
            type: Number,
            default: 50
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.5,
        animationRate: 40,
        stars: [],
        numStars: 0,
        maxOpacity: 0.3,
        maxVel: 0.25,
        animationRate: 40,
        flyers: []
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
            await Promise.all(this.stars.map(async (s) => {
                this.updateStar(s, this.width, this.height*this.cutoff, this.starSize);          
            }));
        },
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            
            this.makeStars(this.width, this.height*this.cutoff);
            this.makeFlyers();
        },
        async makeStars(width, height) {
            const divider = 5000;
            const stars = [];
            const responsiveNum = (this.width * this.height)/divider;
            const numStars = Math.min(this.maxStars, responsiveNum);
            
            for (let i = 0; i < numStars; i++) {
                let xVel = Math.sin(Math.random()*360);
                let yVel = Math.sin(Math.random()*360);

                if (xVel === 0 && yVel === 0) {
                    xVel = 1;
                    yVel = -0.6;
                }

                const mag = Math.sqrt(xVel * xVel + yVel * yVel);
                xVel *= this.maxVel/mag;
                yVel *= this.maxVel/mag;

                const accuracy = 100;
                xVel = Math.round(xVel*accuracy)/accuracy;
                yVel = Math.round(yVel*accuracy)/accuracy;

                const xPos = Math.round(Math.random()*width);
                const yPos = Math.round(Math.random()*height);

                stars.push({
                    x: xPos,
                    y: yPos,
                    xVel: xVel,
                    yVel: yVel
                });
            }

            this.stars = stars;
        },
        async updateStar (s, width, height, boundaryRange) {
            s.x += s.xVel;
            s.y += s.yVel;

            if (s.x < -boundaryRange) {
                s.x += width + boundaryRange*2;
            } else if (s.x > width + boundaryRange) {
                s.x -= (width + boundaryRange*2);
            }

            if (s.y < -boundaryRange) {
                s.y += height + boundaryRange*2;
            } else if (s.y > height + boundaryRange) {
                s.y -= (height + boundaryRange*2);
            }
        },
        async makeFlyers() {
            this.flyers = [];
            const numFlyers = 20;

            for (let i = 0; i < numFlyers; i++) {
                const xPos = Math.round(Math.random() * this.width);
                const yPos = Math.round(Math.random() * this.height);
                const depth = Math.round(100 * Math.random())/100;

                this.flyers.push({
                    x: xPos,
                    y: yPos,
                    depth: depth  
                });
            }
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
