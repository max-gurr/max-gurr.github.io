<template>
  <div class="canvas water-surface-canvas" ref="canvas">
  </div>
</template>

<script>
export default {
    name: 'water-surface',
    props: {
        rippleLength: {
            type: Number,
            default: 3
        },
        rippleGap: {
            type: Number,
            default: 0.35
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        frequency: 400
    }),
    created() {
        this.drawCycle = setInterval(this.draw.bind(this), this.frequency);

        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('click', this.clickHandler);
    },
    methods: {
        async draw() {
            const xPos = Math.random() * this.width;
            const yPos = Math.random() * this.height;

            const canvas = this.$refs['canvas'];
            this.createRipple(xPos, yPos, canvas);
        },
        resizeHandler() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        },
        clickHandler(e) {
            const canvas = this.$refs['canvas'];
            this.createRipple(e.clientX, e.clientY, canvas);
        },
        createRipple(xPos, yPos, canvas) {
            for (let i = 0; i < this.rippleLength; i++) {
                const ripple = document.createElement("div");
                ripple.className = "ripple";
                ripple.style.top = Math.round(yPos) + 'px';
                ripple.style.left = Math.round(xPos) + 'px';
                ripple.style.animationDelay = (i * this.rippleGap) + 's';

                const adjustment = 0.1;
                const opacity = (this.rippleGap*this.rippleLength)/(i*i + 1)*adjustment;
                ripple.style.boxShadow = '0px 0px 25px rgba(255, 255, 255, '+opacity+'),\
                                            0px 0px 75px rgba(255, 255, 255, '+opacity+'),\
                                            inset 0px 0px 25px rgba(255, 255, 255, '+opacity+'),\
                                            inset 0px 0px 75px rgba(255, 255, 255, '+opacity+')';
                // ripple.style.boxShadow = '0px 0px 20px rgba(255, 255, 255, '+opacity+'),\
                //                           inset 0px 0px 20px rgba(255, 255, 255, '+opacity+')';

                ripple.addEventListener( 'animationend', function() {
                    canvas.removeChild(ripple);
                }.bind(this));

                canvas.appendChild(ripple);
            }
        }
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
       window.removeEventListener('resize', this.resizeHandler);
       window.removeEventListener('click', this.clickHandler);
    }
}
</script>

<style lang="scss">
@import '../../assets/variables.scss';

.water-surface-canvas {
    background-color: $bg-dark-blue;

    .ripple {
        position: absolute;
        min-width: 0;
        min-height: 0;
        border-radius: 50%;
        animation: ripple 1.5s ease-out;
        transform: translate(-50%, -50%);
    }

    @keyframes ripple {
        0% {
            opacity: 0;
            min-width: 0;
            min-height: 0;
        }
        20% {
            opacity: 1;
        }
        100% { 
            min-width: 200px;
            min-height: 200px;
            opacity: 0;
        }
    }
}
</style>
