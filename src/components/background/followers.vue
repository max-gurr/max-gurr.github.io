<template>
    <div class="canvas follower-canvas" ref="canvasContainer">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
            <defs>
                <radialGradient id="gradientFill">
                    <stop offset="1%" stop-color="rgba(255, 255, 255, 0.2)" />
                    <stop offset="3%" stop-color="rgba(255, 255, 255, 0.12)" />
                    <stop offset="100%" stop-color="transparent" />
                </radialGradient>
            </defs>
            
            <g v-for="(follower, followerIndex) in followers" :key="'follower-'+followerIndex">
                <circle class="follower" :cx="follower.x" :cy="follower.y" :r="size" fill="url(#gradientFill)"/>
                <!-- <path v-if="follower.historyPath" :d="follower.historyPath" fill="none" stroke="rgba(255, 255, 255, 0.1)" /> -->
                <!-- <circle v-for="(history, historyIndex) in follower.history" :key="'follower-'+followerIndex+'-history-'+historyIndex" :r="2-historyIndex*0.2" :cx="history.x" :cy="history.y" fill="rgba(255, 255, 255, 0.1)" /> -->
            </g>
        </svg>
    </div>
</template>

<script>
export default {
    name: 'followers',
    props: {
        size: {
            type: Number,
            default: 150
        },
        numFollowers: {
            type: Number,
            default: 20
        },
        mouseRadius: {
            type: Number,
            default: 150
        },
        trailLength: {
            type: Number,
            default: 15
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        followers: [],
        maxVel: 1,
        maxForce: 0.5,
        mouseX: 0,
        mouseY: 0,
        squareMouseRadius: 0,
        historyStateGap: 2
    }),
    created() {
        this.drawCycle = setInterval(this.draw.bind(this), 40);

        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('click', this.clickHandler);
    },
    mounted() {
        this.followers = this.makeFollowers(this.numFollowers);
        this.squareMouseRadius = this.mouseRadius * this.mouseRadius;
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
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
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
                    yAcc: 0,
                    history: [],
                    frame: 0
                }
                this.randomiseVelocity(newFollower);
                followers.push(newFollower);
            }

            return followers;
        },
        opposedLine(pointA, pointB) {
            // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
            
            const lengthX = pointB[0] - pointA[0]
            const lengthY = pointB[1] - pointA[1]
            return {
                length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
                angle: Math.atan2(lengthY, lengthX)
            }
        },
        controlPoint(current, previous, next, reverse) {
            // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

            // When 'current' is the first or last point of the array
            // 'previous' or 'next' don't exist.
            // Replace with 'current'
            const p = previous || current
            const n = next || current
            // The smoothing ratio
            const smoothing = 0.2
            // Properties of the opposed-line
            const o = this.opposedLine(p, n)
            // If is end-control-point, add PI to the angle to go backward
            const angle = o.angle + (reverse ? Math.PI : 0)
            const length = o.length * smoothing
            // The control point position is relative to the current point
            const x = current[0] + Math.cos(angle) * length
            const y = current[1] + Math.sin(angle) * length
            return [x, y]
        },
        bezierCommand(point, i, a) {
            // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

            // start control point
            const [cpsX, cpsY] = this.controlPoint(a[i - 1], a[i - 2], point)
            // end control point
            const [cpeX, cpeY] = this.controlPoint(point, a[i - 1], a[i + 1], true)
            return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`
        },
        svgPath(points, command) {
            // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

            // build the d attributes by looping over the points
            const path = points.reduce((acc, point, i, a) => i === 0
                // if first point
                ? `M ${point[0]},${point[1]}`
                // else
                : `${acc} ${command(point, i, a)}`
            , '')
            return path;
        },
        async updateFollower(f) {
            // Push back history
            f.frame += 1;
            if (f.frame > this.historyStateGap) {
                f.frame = 0;
                for (let i = Math.min(f.history.length, this.trailLength)-1; i > 0; i--) {
                    f.history[i] = f.history[i-1]
                }
                const newHistoryPos = {
                    x: f.x,
                    y: f.y
                }
                // Store pos in history
                if (f.history.length < this.trailLength) {
                    f.history.unshift(newHistoryPos)
                } else {
                    f.history[0] = newHistoryPos;
                }
            }
            
            // Add acc to vel
            f.xVel += f.xAcc;
            f.yVel += f.yAcc;

            // Add vel to pos
            f.x += f.xVel;
            f.y += f.yVel;

            // Adjust x-pos
            if (f.x < -this.size/2) {
                f.x += this.width + this.size;
                f.history = [];
            } else if (f.x > this.width + this.size/2) {
                f.x -= this.width + this.size;
                f.history = [];
            }
            // Adjust y-pos
            if (f.y < -this.size/2) {
                f.y += this.height + this.size;
                f.history = [];
            } else if (f.y > this.height + this.size/2) {
                f.y -= this.height + this.size;
                f.history = [];
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

            // History path
            if (f.history.length > 0) {
                const currentState = {x: f.x, y: f.y};
                const fullStateArray = [currentState, ...f.history].map((s) => [s.x, s.y]);
                f.historyPath = this.svgPath(fullStateArray, this.bezierCommand);
            } else {
                f.historyPath = null;
            }
            
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

                // f.history = [];
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
