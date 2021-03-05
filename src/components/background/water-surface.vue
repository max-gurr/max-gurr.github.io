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
            default: 0.25
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        frequency: 500
    }),
    created() {
        this.drawCycle = setInterval(async function() {
            const xPos = Math.random() * this.width;
            const yPos = Math.random() * this.height;

            const canvas = this.$refs['canvas'];
            this.createRipple(xPos, yPos, canvas);
        }.bind(this), this.frequency);
    },
    mounted() {
        const canvas = this.$refs['canvas'];
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        });
        window.addEventListener('click', (e) => {
            this.createRipple(e.clientX, e.clientY, canvas);
        });
    },
    methods: {
        createRipple(xPos, yPos, canvas) {
            for (let i = 0; i < this.rippleLength; i++) {
                const ripple = document.createElement("div");
                ripple.className = "ripple";
                ripple.style.top = Math.round(yPos) + 'px';
                ripple.style.left = Math.round(xPos) + 'px';
                ripple.style.animationDelay = (i * 0.3) + 's';

                const opacity = this.rippleGap / ((i + 1)*2);
                ripple.style.boxShadow = '0px 0px 10px 2px rgba(255, 255, 255, ' + opacity + '),0px 0px 15px 2px rgba(255, 255, 255, ' + opacity + '),0px 0px 50px 2px rgba(255, 255, 255, ' + opacity + ')';
                
                ripple.addEventListener( 'animationend', function() {
                    canvas.removeChild(ripple);
                }.bind(this));

                canvas.appendChild(ripple);
            }
        }
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
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
        opacity: 0;
        animation: ripple-animate 1.5s ease;
        transform: translate(-50%, -50%);
    }

    @keyframes ripple-animate {
        0% {
            opacity: 0;
            min-width: 0;
            min-height: 0;
        }
        15% {
            opacity: 1;
        }
        100% { 
            min-width: 100px;
            min-height: 100px;
            opacity: 0;
        }
    }
}
</style>
