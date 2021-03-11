<template>
    <div class="canvas follower-canvas" ref="canvasContainer">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
            <g v-for="(f, followerIndex) in followers" :key="'follower-'+followerIndex">
                <defs>
                    <radialGradient :id="'gradientFill-'+followerIndex">
                        <!-- <stop offset="0%" stop-color="transparent" /> -->
                        <!-- <stop offset="60%" :stop-color="f.fill" /> -->
                        <stop offset="30%" :stop-color="'rgba('+(100 + 80*(f.xAcc+f.yAcc))+', '+ (50 + 155*f.x/width)+', '+(50 + 155*(f.y/height))+', 0.20)'" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                </defs>
            
                <circle class="follower" :cx="f.x" :cy="f.y" :r="f.size" :fill="'url(#gradientFill-'+followerIndex+')'"/>
            </g>
            <g>
                <!-- Static background -->
                <defs>
                    <radialGradient id='f1'>
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="70%" stop-color="rgba(100, 100, 180, 0.125)" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                    <radialGradient id='f2'>
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="70%" stop-color="rgba(50, 200, 100, 0.125)" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                    <radialGradient id='f3'>
                        <stop offset="0%" stop-color="transparent" />
                        <stop offset="70%" stop-color="rgba(200, 100, 125, 0.125)" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                </defs>
                <!-- Blue circle -->
                <circle :cx="this.width/1.15" :cy="this.height/8" :r="Math.max(this.width, this.height)/2.8" fill="url(#f1)" />
                <!-- Green circle -->
                <circle :cx="this.width/10" :cy="this.height/3" :r="Math.max(this.width, this.height)/2.15" fill="url(#f2)" />
                <!-- Red circle -->
                <circle :cx="this.width/1.75" :cy="this.height" :r="Math.max(this.width, this.height)/3" fill="url(#f3)" />
            </g>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'followers',
    props: {
        maxSize: {
            type: Number,
            default: 300
        },
        numFollowers: {
            type: Number,
            default: 25
        },
        mouseRadius: {
            type: Number,
            default: 200
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        followers: [],
        maxVel: 1.6,
        maxForce: 0.5,
        mouseX: 0,
        mouseY: 0,
        squareMouseRadius: 0,
        size: 0,
        frameRate: 40,
        followerOpacity: 0.2
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('click', this.clickHandler);
    },
    mounted() {
        this.squareMouseRadius = this.mouseRadius * this.mouseRadius;
        this.resizeHandler();

        this.drawCycle = setInterval(this.draw.bind(this), this.frameRate);
        // window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.frameRate);
    },
    methods: {
        async draw() {
            await Promise.all(this.followers.map(async (f) => {
                this.updateFollower(f);
                if (this.mouseX > 0 || this.mouseY > 0) {
                    this.pointTowardsMouse(f);
                }
            }));

            // Reset mouse attractor point
            this.mouseX = 0;
            this.mouseY = 0;

            // window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.frameRate);
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const divider = 3;
            this.size = Math.min(this.maxSize, Math.max(this.width/divider, this.height/divider));

            this.makeFollowers(this.numFollowers);
        },
        async mouseMoveHandler(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        },
        async clickHandler(e) {
            const canvas = this.$refs['canvasContainer']
            const clickElm = document.createElement("div");
            clickElm.className = "click-ripple";

            clickElm.style.top = e.clientY+'px';
            clickElm.style.left = e.clientX+'px';

            clickElm.addEventListener( 'animationend', function() {
                canvas.removeChild(clickElm);
            }.bind(this));

            canvas.appendChild(clickElm);

            await Promise.all(this.followers.map(async (f) => {
                this.repelFromMouse(f, e);
            }));
        },
        async makeFollowers (num) {
            this.followers = [];

            for (let i = 0; i < num; i++) {
                const newFollower = await this.generateRandomFollower();
                this.followers.push(newFollower);
            }
        },
        async updateFollower(f) {
            // Add acc to vel
            f.xVel += f.xAcc;
            f.yVel += f.yAcc;

            // Add vel to pos
            f.x += f.xVel;
            f.y += f.yVel;

            // Adjust x-pos
            if (f.x < -f.size) {
                f.x += this.width + f.size*2;
            } else if (f.x > this.width + f.size) {
                f.x -= this.width + f.size*2;
            }
            // Adjust y-pos
            if (f.y < -f.size) {
                f.y += this.height + f.size*2;
            } else if (f.y > this.height + f.size) {
                f.y -= this.height + f.size*2;
            }

            // Adjust vel
            const velMag = Math.sqrt(f.xVel * f.xVel + f.yVel * f.yVel);   
            if (velMag !== 0) {        
                f.xVel = this.maxVel * (f.xVel/velMag);
                f.yVel = this.maxVel * (f.yVel/velMag);
            }

            // Reset acc
            f.xAcc /= 2;
            f.yAcc /= 2;
        },
        async pointTowardsMouse(f, e) {
            const xDist = this.mouseX - f.x;
            const yDist = this.mouseY - f.y;

            const posSquare = xDist * xDist + yDist * yDist;
            if (posSquare < this.squareMouseRadius) {
                const xVelDelta = xDist - f.xVel;
                const yVelDelta = yDist - f.yVel;

                const velMag = Math.sqrt(xVelDelta * xVelDelta + yVelDelta * yVelDelta);            
                const xForce = this.maxForce * (xVelDelta/velMag);
                const yForce = this.maxForce * (yVelDelta/velMag);

                f.xAcc += xForce;
                f.yAcc += yForce;
            }
        },
        async repelFromMouse(f, e) {
            const xDist = f.x - e.clientX;
            const yDist = f.y - e.clientY;

            const posSquare = xDist * xDist + yDist * yDist;
            if (posSquare < this.squareMouseRadius*2) {
                const xVelDelta = xDist - f.xVel;
                const yVelDelta = yDist - f.yVel;

                const velMag = Math.sqrt(xVelDelta * xVelDelta + yVelDelta * yVelDelta);
                const maxMag = (this.mouseRadius/velMag);
                
                const xForce = maxMag * 10 * (xVelDelta/velMag);
                const yForce = maxMag * 10 * (yVelDelta/velMag);

                f.xAcc += Math.min(xForce, this.maxForce * 20);
                f.yAcc += Math.min(yForce, this.maxForce * 20);
            }
        },
        async generateRandomFollower() {
            // Random size
            const sizeRange = this.size - this.size/4;
            const size = this.size - Math.random() * sizeRange;
            
            // Random position
            const x = Math.round(Math.random()*this.width);
            const y = Math.round(Math.random()*this.height);

            // Random velocity
            let xVel = Math.sin(Math.random()*360);
            let yVel = Math.sin(Math.random()*360);

            if (xVel === 0 && yVel === 0) {
                xVel = 0.5;
                yVel = 0.5;
            }

            // Random fill
            const r = 0 + Math.round(Math.random() * 200);
            const g = 100 + Math.round(Math.random() * 155);
            const b = 100 + Math.round(Math.random() * 155);
            const fill = 'rgba('+r+', '+g+', '+b+', '+this.followerOpacity+')';

            const newFollower = {
                x: x,
                y: y,
                xVel: xVel,
                yVel: yVel,
                xAcc: 0,
                yAcc: 0,
                fill: fill,
                size: size
            }

            return newFollower;
        }
    },
    beforeDestroy() {
        clearInterval(this.drawCycle);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('click', this.clickHandler);
        window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
}
</script>

<style lang="scss">
@import '../../assets/variables.scss';

.follower-canvas {
    background-color: $bg-dark-blue;

    .click-ripple {
        position: absolute;
        border-radius: 50%;
        animation: follower-ripple-animate 0.4s;
        transform: translate(-50%, -50%);
        box-shadow: 0px 0px 30px white,
                    inset 0px 0px 30px white;
    }

    @keyframes follower-ripple-animate {
        1% {
            opacity: 0.3;
            width: 0px;
            height: 0px;
        }
        100% {
            opacity: 0;
            width: 300px;
            height: 300px;
        }
    }
}
</style>
