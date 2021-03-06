<template>
    <div class="canvas follower-canvas" ref="canvasContainer">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
            <defs>
                <radialGradient id="gradientFill">
                    <stop offset="1%" stop-color="rgba(255, 255, 255, 0.2)" />
                    <stop offset="6%" stop-color="rgba(255, 255, 255, 0.125)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            
            <circle class="follower"  v-for="(follower, index) in followers" :key="'follower-' + index" :cx="follower.x" :cy="follower.y" :r="size/2" fill="url(#gradientFill)"/>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'followers',
    props: {
        size: {
            type: Number,
            default: 250
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
        drawCycle: null,
        followers: [],
        maxVel: 2,
        maxForce: 0.5,
        mouseX: 0,
        mouseY: 0,
        squareMouseRadius: 0
    }),
    created() {
        this.drawCycle = setInterval(async function() {
            await Promise.all(this.followers.map(async (f) => {
                this.updateFollower(f);
                if (this.mouseX > 0 || this.mouseY > 0) {
                    this.pointTowardsMouse(f);
                }
            }));

            // Reset mouse attractor point
            this.mouseX = 0;
            this.mouseY = 0;
        }.bind(this), 40);
    },
    mounted() {
        window.addEventListener('resize', this.resizeHandler((e) => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }));

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('click', async (e) => {
            await this.clickHandler(e);

            await Promise.all(this.followers.map(async (f) => {
                this.repelFromMouse(f, e);
            }));
        });

        this.followers = this.makeFollowers(this.numFollowers);
        this.squareMouseRadius = this.mouseRadius * this.mouseRadius;
    },
    methods: {
        resizeHandler(func) {
            let timer;
            return (event) => {
                if(timer) clearTimeout(timer);
                timer = setTimeout(func,500,event);
            };
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
            const velMag = Math.sqrt(f.xVel * f.xVel + f.yVel * f.yVel);   
            if (velMag !== 0) {        
                f.xVel = this.maxVel * (f.xVel/velMag);
                f.yVel = this.maxVel * (f.yVel/velMag);
            }

            // Adjust x-pos
            if (f.x < -this.size/2) {
                f.x += this.width + this.size;
            } else if (f.x > this.width + this.size/2) {
                f.x -= this.width + this.size;
            }
            // Adjust y-pos
            if (f.y < -this.size/2) {
                f.y += this.height + this.size;
            } else if (f.y > this.height + this.size/2) {
                f.y -= this.height + this.size;
            }

            // Reset acc
            f.xAcc /= 2;
            f.yAcc /= 2;

            console.log(this.width + ': ' + f.x + '    ' + this.height + ': ' + f.y);
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

                console.log(maxMag);
            }
        },
        randomiseVelocity(f) {
            var xVel = Math.sin(Math.random()*360);
            var yVel = Math.sin(Math.random()*360);

            if (xVel === 0 && yVel === 0) {
                xVel = 0.5;
                yVel = 0.5;
            }

            f.xVel = xVel;
            f.yVel = yVel;
        }
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
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
        animation: ripple-animate 0.5s;
        transform: translate(-50%, -50%);
    }

    @keyframes ripple-animate {
        0% {
            min-width: 0px;
            min-height: 0px;
            border: solid 5px rgba(255, 255, 255, 0.3);
            box-shadow: 0px 0px 15px rgba(255, 255, 255, 0.25),
                    0px 0px 30px rgba(255, 255, 255, 0.25),
                    0px 0px 100px rgba(255, 255, 255, 0.25);
        }
        100% {
            min-width: 300px;
            min-height: 300px;
            border: solid 5px rgba(255, 255, 255, 0);
            box-shadow: none;
        }
    }
}
</style>
