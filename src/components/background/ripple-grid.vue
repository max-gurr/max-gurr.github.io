<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="canvas ripple-grid-canvas" :viewBox="'0 0 ' + this.width + ' ' + this.height">
        <g v-for="(row, index) in grid" :key="'row-' + index">
            <circle class="cell" v-for="(cell, index) in row" :key="'cell-' + index" :cx="cell.x + size/2" :cy="cell.y + size/2" :r="size/2 * cell.opacity" fill="rgb(10, 10, 35)"/>
        </g>
    </svg>
</template>

<script>
export default {
    name: 'ripple-grid',
    props: {
        size: {
            type: Number,
            default: 15
        },
        mouseRadius: {
            type: Number,
            default: 100
        },
        frequency: {
            type: Number,
            default: 20
        },
        dotColor: {
            type: String,
            defualt: 'rgb(10, 10, 35)'
        }
    },
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        drawCycle: null,
        grid: [],
        actors: [],
        actualWidth: 1,
        actualHeight: 1
    }),
    created() {
        
    },
    mounted() {
        window.addEventListener('resize', this.resizeHandler((e) => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.createGrid();
        }));

        window.addEventListener('mousemove', (e) => {
            for (let i = 0; i < this.grid.length; i++) {
                for (let j = 0; j < this.grid[i].length; j++) {
                    const cell = this.grid[i][j];
                    const dist = this.getDist(cell.x, cell.y, e.clientX, e.clientY);
                    this.addDistToCell(cell, dist, this.mouseRadius);
                }
            }
        });

        window.addEventListener('click', (e) => {
            for (let i = 0; i < this.grid.length; i++) {
                for (let j = 0; j < this.grid[i].length; j++) {
                    const cell = this.grid[i][j];
                    const dist = this.getDist(cell.x, cell.y, e.clientX, e.clientY);
                    this.addDistToCell(cell, dist, this.mouseRadius*2);
                }
            }
        });
        this.createGrid();
    },
    methods: {
        resizeHandler(func) {
            let timer;
            return (event) => {
                if(timer) clearTimeout(timer);
                timer = setTimeout(func,500,event);
            };
        },
        getDist(x1, y1, x2, y2) {
            const xDist = x1 - x2;
            const yDist = y1 - y2;
            const dist = Math.sqrt(xDist * xDist + yDist * yDist);

            return dist;
        },
        addInverseDistToCell(cell, dist, radius) {
            if (dist < radius) {
                cell.opacity = -dist / radius + 1;
            } else {
                cell.opacity += 0.05;
            }
            cell.opacity = Math.min(1, cell.opacity);
        },
        addDistToCell(cell, dist, radius) {
            if (dist < radius) {
                cell.opacity = dist/radius;
            } else {
                cell.opacity += 0.05;
            }
            cell.opacity = Math.min(1, cell.opacity);
        },
        createGrid() {
            const padding = 1;

            this.grid = [];
            const cols = Math.round(this.width/(this.size + padding*2));
            const rows = Math.round(this.height/(this.size + padding*2));

            const actualWidth = this.width/cols;
            const actualHeight = this.height/rows;

            for (let i = 0; i < rows; i++) {
                const newRow = [];
                for (let j = 0; j < cols; j++) {
                    newRow.push({
                        x: Math.round(j * actualWidth),
                        y: Math.round(i * actualHeight),
                        opacity: 1
                    });
                }

                this.grid.push(newRow);
            }

            this.actualWidth = actualWidth;
            this.actualHeight = actualHeight;
        }
    },
    beforeDestroy() {
       clearInterval(this.drawCycle);
    }
}
</script>

<style scoped lang="scss">
@import '../../assets/variables.scss';

.ripple-grid-canvas {
    background-color: $bg-dark-blue;
}
</style>
