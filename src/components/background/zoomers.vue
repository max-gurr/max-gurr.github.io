<template>
<div>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas zoomers-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <g 
            v-for="(z, zIndex) in zoomers" 
            :key="'zoomer-'+zIndex"
        >
            <g 
                v-for="(seg, segIndex) in z.body" 
                :key="'zoomer-'+zIndex+'-segment-'+segIndex"
            >
                <circle 
                    :cx="seg.x * boxWidth" 
                    :cy="seg.y * boxHeight" 
                    :r="idealBoxSize - 0.5*segIndex" 
                    :fill="'rgba(255, 255, 255, '+(maxOpacity - 0.01*segIndex)+')'"
                />
            </g>
        </g> 
    </svg>
</div>
</template>

<script>
export default {
    name: 'zoomers',
    props: {
        idealBoxSize: {
            type: Number,
            default: 10
        },
        numZoomers: {
            type: Number,
            default: 10
        },
        zoomerBodyLength: {
            type: Number,
            default: 16
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        maxOpacity: 0.3,
        animationRate: 70,
        boxWidth: 0,
        boxHeight: 0,
        numCols: 0,
        numRows: 0,
        zoomers: []
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
            await Promise.all(this.zoomers.map(async (z) => {
                this.updateZoomer(z);
            }));
        },
        async resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.calculateGridParams();
            this.makeZoomers();
        },
        calculateGridParams() {
            this.numCols = Math.round(this.width/this.idealBoxSize);
            this.numRows = Math.round(this.height/this.idealBoxSize);

            this.boxWidth = this.width/this.numCols;
            this.boxHeight = this.height/this.numRows;
        },
        async makeZoomers() {
            for (let i = 0; i < this.numZoomers; i++) {
                const xPos = Math.floor(Math.random() * this.numCols);
                const yPos = Math.floor(Math.random() * this.numRows);

                const xVel = 0;
                const yVel = 0;
                const randomDirNum = Math.random();
                if (randomDirNum < 0.25) {
                    // Move right
                    xVel = 1;
                } else if (randomDirNum < 0.5) {
                    // Move left
                    xVel = -1;
                } else if (randomDirNum < 0.75) {
                    // Move up
                    yVel = 1;
                } else {
                    // Move down
                    yVel = -1;
                }

                this.zoomers.push({
                    xVel: xVel,
                    yVel: yVel,
                    body: [
                        {x: xPos, y: yPos}
                    ]
                });
            }
        },
        async updateZoomer(z) {
            // Adjust directions
            const head = z.body[0];
            let newX = head.x + z.xVel;
            let newY = head.y + z.yVel;
            
            // Travelling up
            if (z.yVel < 0) {
                // Hit top of page
                if (head.y === 0) {
                    z.yVel *= -1;
                }
            }
            // Travelling down
            else if (z.yVel > 0) {
                // Hit bottom of page
                if (head.y === this.numRows) {
                    z.yVel *= -1;
                }
            }
            // Travelling Left
            else if (z.xVel < 0) {
                // Hit left side of page
                if (head.x === 0) {
                    z.xVel *= -1;
                }
            }
            // Travelling right
            else if (z.xVel > 0) {
                // Hit right side of page
                if (head.x === this.numCols) {
                    z.xVel *= -1;
                }
            }

            

            // Check for overlap with over zoomers
            let shouldRedirect = false;
            this.zoomers.forEach((otherZ) => {
                otherZ.body.forEach((seg) => {
                    if (seg.x === newX && seg.y === newY) {
                        shouldRedirect = true;
                    }
                });
            });

            if (shouldRedirect) {
                // Travelling vertically
                if (z.yVel !== 0) {
                    z.yVel = 0;
                    // Redirect to other side of screen
                    if (head.x <= this.numCols/2) {
                        z.xVel = 1;
                    } else {
                        z.xVel = -1;
                    }
                } 
                // Travelling horizontally
                else if (z.yVel !== 0) {
                    z.xVel = 0;
                    // Redirect to other side of screen
                    if (head.y <= this.numRows/2) {
                        z.yVel = 1;
                    } else {
                        z.yVel = -1;
                    }
                }
            }

            newX = head.x + z.xVel;
            newY = head.y + z.yVel;

            // Move body segments
            for (let x = z.body.length-1; x > 0; x--) {
                const bodyPiece = z.body[x];
                const prevBodyPiece = z.body[x-1];

                bodyPiece.x = prevBodyPiece.x;
                bodyPiece.y = prevBodyPiece.y;
            }

            if (z.body.length < this.zoomerBodyLength) {
                z.body.unshift({x: newX, y: newY});
            } else {
                head.x += z.xVel;
                head.y += z.yVel;
            }
        },
    },
    beforeDestroy() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('mousemove', this.mousemoveHandler);
    }
}
</script>

<style lang="scss">
@import '../../assets/variables.scss';

.zoomers-canvas {
    background: $bg-dark-blue;
}
</style>
