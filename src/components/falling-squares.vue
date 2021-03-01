<template>
  <div class="canvas falling-squares-canvas" ref="canvas">
      
  </div>
</template>

<script>
export default {
    name: 'falling-squares',
    props: {
        numSquares: {
            type: Number,
            default: 10
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null
    }),
    mounted() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        });

        this.drawCycle = setInterval(async function() {
            const canvas = this.$refs['canvas']
            const squareContainer = document.createElement("div");
            squareContainer.className = "square-container";

            squareContainer.style.top = Math.floor(Math.random() * this.height)+'px';
            squareContainer.style.left = Math.floor(Math.random() * this.width)+'px';

            let square;
            for (let i = 0; i < this.numSquares; i++) {
                square = document.createElement("div");
                square.className = "square";
                squareContainer.appendChild(square);
            }
            square.addEventListener( 'animationend', function() {
                canvas.removeChild(squareContainer);
            }.bind(this));

            canvas.appendChild(squareContainer);
        }.bind(this), 100);
    },
    methods: {
        
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
    }
}
</script>

<style lang="scss">
    .falling-squares-canvas {
        background-color: rgb(38, 38, 77);

        .square-container {
            position: absolute;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            @for $i from 1 to 99 {
                .square:nth-child(#{$i}) { animation-delay: $i * 0.1s; }
            }

            .square {
                min-width: 10px;
                min-height: 10px;
                border-radius: 50%;
                opacity: 0;
                box-shadow: 0 0 2px 4px rgba(255, 255, 255, 0.2);
                background-color: rgba(255, 255, 255, 0.25);
                animation: square-animate 0.5s ease;
            }
        }

        @keyframes square-animate {
            0% {
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% { 
                opacity: 0;
            }
        }
    }
</style>
