<template>
    <div class="canvas follower-canvas" ref="canvasContainer">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
            <g v-for="(follower, followerIndex) in followers" :key="'follower-'+followerIndex">
                <defs>
                    <radialGradient :id="'gradientFill-'+followerIndex">
                        <!-- <stop offset="0%" stop-color="rgba(255, 255, 255, 0.10)" /> -->
                        <stop offset="3%" :stop-color="'rgba('+(50 + 80*(follower.xAcc+follower.yAcc))+', '+(255*follower.x/width)+', '+(255*(follower.y/height))+', 0.20)'" />
                        <stop offset="100%" stop-color="transparent" />
                    </radialGradient>
                </defs>
            
                <circle class="follower" :cx="follower.x" :cy="follower.y" :r="size" :fill="'url(#gradientFill-'+followerIndex+')'"/>
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
            default: 20
        },
        mouseRadius: {
            type: Number,
            default: 150
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        followers: [],
        maxVel: 1.6,
        maxForce: 0.5,
        mouseX: 0,
        mouseY: 0,
        squareMouseRadius: 0,
        size: 0,
        animationRate: 50
    }),
    created() {
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('click', this.clickHandler);
    },
    mounted() {
        this.followers = this.makeFollowers(this.numFollowers);
        this.squareMouseRadius = this.mouseRadius * this.mouseRadius;

        this.resizeHandler();

        window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.animationRate);
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

            window.setTimeout(window.requestAnimationFrame(this.draw.bind(this)), this.animationRate);
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            const divider = 2;
            this.size = Math.min(this.maxSize, Math.min(this.width/divider, this.height/divider));
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
        makeFollowers (num) {
            let followers = [];

            for (let i = 0; i < num; i++) {
                const newFollower = {
                    x: Math.random()*this.width,
                    y: Math.random()*this.height,
                    xVel: 0,
                    yVel: 0,
                    xAcc: 0,
                    yAcc: 0
                }
                this.randomiseVelocity(newFollower);
                followers.push(newFollower);
            }

            return followers;
        },
        async updateFollower(f) {
            // Add acc to vel
            f.xVel += f.xAcc;
            f.yVel += f.yAcc;

            // Add vel to pos
            f.x += f.xVel;
            f.y += f.yVel;

            // Adjust x-pos
            if (f.x < -this.size) {
                f.x += this.width + this.size*2;
            } else if (f.x > this.width + this.size) {
                f.x -= this.width + this.size*2;
            }
            // Adjust y-pos
            if (f.y < -this.size) {
                f.y += this.height + this.size*2;
            } else if (f.y > this.height + this.size) {
                f.y -= this.height + this.size*2;
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
        randomiseVelocity(f) {
            let xVel = Math.sin(Math.random()*360);
            let yVel = Math.sin(Math.random()*360);

            if (xVel === 0 && yVel === 0) {
                xVel = 0.5;
                yVel = 0.5;
            }

            f.xVel = xVel;
            f.yVel = yVel;
        }
    },
    beforeDestroy() {
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
        animation: ripple-animate 0.4s;
        transform: translate(-50%, -50%);
    }

    @keyframes ripple-animate {
        0% {
            $opacity: 0.3;
            min-width: 0px;
            min-height: 0px;
            box-shadow: 0px 0px 15px rgba(255, 255, 255, $opacity),
                    0px 0px 30px rgba(255, 255, 255, $opacity),
                    0px 0px 100px rgba(255, 255, 255, $opacity);
        }
        100% {
            min-width: 300px;
            min-height: 300px;
            box-shadow: none;
        }
    }
}
</style>
