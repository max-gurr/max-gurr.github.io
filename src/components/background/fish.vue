<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas fish-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <filter id="blurFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
        </filter>
        
        <g v-for="(f, index) in fish" :key="'fish-'+index" :transform="'rotate('+f.rotation+', '+f.x+', '+f.y+')'" :opacity="fishOpacity" filter="url(#blurFilter)">
            <!-- Fish shape path
                <path :d="
                    'M ' + (f.x) + ' ' + (f.y-fishSize) + 
                    ' c -'+fishSize+' '+fishSize*0.25+' -'+fishSize+ ' '+fishSize*1.85+' 0 '+fishSize*2+
                    ' m 0 -'+fishSize/2+
                    ' l -'+fishSize*0.75+' '+fishSize+
                    ' q '+fishSize*0.75+' -'+fishSize*0.5+' '+fishSize*2*0.75+' 0'+
                    ' l -'+fishSize*0.75+' -'+fishSize+
                    ' M ' + (f.x) + ' ' + (f.y+fishSize) + 
                    ' c '+fishSize+' -'+fishSize*0.15+' '+fishSize+' -'+fishSize*1.75+' 0 -'+fishSize*2+
                    ' m -'+fishSize/2+' '+fishSize+
                    ' q '+fishSize/2+' -'+fishSize+' '+fishSize+' 0'+
                    ' q -'+fishSize/2+' -'+fishSize/2+' -'+fishSize+' 0'
                " :fill="fishColour" /> -->

            <!-- Triangle shape path -->
            <path :d="
                'M ' + (f.x) + ' ' + (f.y-fishSize)+
                ' l -'+fishSize/2+' '+fishSize+
                ' q '+fishSize/2+' -'+fishSize/2+' '+fishSize+' 0 z'
            " :fill="fishColour" />
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
        }
    },
    data: () => ({
        fish: [],
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        fishOpacity: 0.3,
        maxVel: 2,
        fishColour: 'rgb(255, 100, 100)'
    }),
    created() {
        this.drawCycle = setInterval(this.draw.bind(this), 40);
    },
    mounted() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('click', this.clickHandler);

        this.makeFish();
    },
    methods: {
        async draw() {
            await Promise.all(this.fish.map(async (f) => {
                this.updateFish(f, this.fishSize);          
            }));
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
                    rotation: 0
                });
            }

            this.fish = fish;
        },
        async updateFish(f, range) {
            // Add vel to pos
            f.x += f.xVel;
            f.y += f.yVel;

            if (f.x < -range/2) {
                f.x += this.width + range;
            } else if (f.x > this.width + range/2) {
                f.x -= (this.width + range);
            }

            if (f.y < -range/2) {
                f.y += this.height + range;
            } else if (f.y > this.height + range/2) {
                f.y -= (this.height + range);
            }

            // Calculate rotation
            f.rotation = (Math.atan2(f.yVel, f.xVel)/Math.PI) * 180 + 90;
        },
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
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
