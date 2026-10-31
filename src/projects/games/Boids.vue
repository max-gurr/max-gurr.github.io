<template>
    <div class="page">
        <SiteNav title="Boids"/>
        <div id="boids-background">
            <canvas
                ref="boidsCanvas"
                class="canvas boids-canvas"
            ></canvas>
        </div>

        <!-- Controls panel: a flex child under the nav, so it's sized by the layout rather than a magic offset -->
        <div class="panel-area">
            <div class="boids-panel" :class="{ open: panelOpen }">
                <button
                    class="panel-toggle"
                    type="button"
                    :aria-expanded="panelOpen"
                    aria-controls="boids-controls"
                    :aria-label="panelOpen ? 'Close controls' : 'Open controls'"
                    @click="panelOpen = !panelOpen"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path v-if="!panelOpen" d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path v-if="!panelOpen" d="M16 4v4M8 10v4M18 16v4"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path v-else d="M9 5l7 7-7 7" fill="none" stroke="currentColor"
                            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <aside id="boids-controls" class="panel-body" :inert="!panelOpen">
                    <header class="panel-header">
                        <h2>Controls</h2>
                    </header>

                    <div class="panel-actions">
                        <button type="button" @click="paused = !paused">{{ paused ? 'Play' : 'Pause' }}</button>
                        <button type="button" @click="createSchool">Scatter</button>
                        <button type="button" @click="resetSettings">Reset</button>
                    </div>

                    <section v-for="group in controlGroups" :key="group.title" class="panel-group">
                        <div class="group-head">
                            <button
                                v-if="group.toggle"
                                type="button"
                                class="icon-toggle"
                                :class="{ active: settings[group.toggle.key] }"
                                :aria-pressed="!!settings[group.toggle.key]"
                                :aria-label="group.toggle.label"
                                :title="group.toggle.label"
                                @click="settings[group.toggle.key] = !settings[group.toggle.key]"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                        fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <h3>{{ group.title }}</h3>
                        </div>
                        <div
                            v-for="c in group.controls"
                            :key="c.key"
                            class="control"
                            :class="{ 'control-inline': c.type === 'toggle' }"
                        >
                            <template v-if="c.type === 'toggle'">
                                <label :for="'ctl-' + c.key">{{ c.label }}</label>
                                <input :id="'ctl-' + c.key" type="checkbox" v-model="settings[c.key]" />
                            </template>
                            <template v-else>
                            <div class="control-head">
                                <label :for="'ctl-' + c.key">{{ c.label }}</label>
                                <span class="control-value">
                                    <input
                                        type="number"
                                        class="control-number"
                                        :min="c.min"
                                        :max="c.max"
                                        :step="c.step"
                                        :aria-label="c.label + ' value'"
                                        v-model.lazy.number="settings[c.key]"
                                    />
                                    <span v-if="c.unit" class="control-unit">{{ c.unit }}</span>
                                </span>
                            </div>
                            <input
                                :id="'ctl-' + c.key"
                                type="range"
                                :min="c.min"
                                :max="c.max"
                                :step="c.step"
                                v-model.number="settings[c.key]"
                            />
                            </template>
                        </div>
                    </section>

                    <section class="panel-group">
                        <h3>Look</h3>
                        <div class="control">
                            <div class="control-head">
                                <label for="ctl-palette">Body colours</label>
                            </div>
                            <select id="ctl-palette" v-model="settings.palette">
                                <option v-for="p in paletteOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                            </select>
                        </div>
                        <div v-if="settings.palette === 'custom'" class="control control-inline">
                            <label for="ctl-custom-colour">Custom colour</label>
                            <input id="ctl-custom-colour" type="color" v-model="settings.customColour" />
                        </div>
                        <div class="panel-actions">
                            <button type="button" @click="assignColours(); render()">Reshuffle colours</button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    </div>
</template>

<script>
import { createKoiSchool, createKoiFish } from '@/components/background/koiFish.js'
import SiteNav from '@/components/SiteNav.vue'
import MathUtil from '@/util/MathUtil.js'

const DRAW_SCALE = 1.25
// Backing-store pixels per CSS pixel. The canvas is blurred by 2px in CSS, so retina
// resolution is invisible. 1 is visually identical and 4x cheaper than DPR 2.
const RENDER_SCALE = 1
const BASE_UPDATE_HZ = 60            // simulation rate at speed 1, independent of the display's refresh rate
const MAX_STEPS_PER_FRAME = 5        // stops a catch-up spiral after a long pause
const RESIZE_DEBOUNCE = 150

let bodyColours = [
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 128, 0)',
	'rgb(255, 128, 0)',
	'rgb(255, 128, 0)',
	'rgb(255, 128, 0)',
	'rgb(240 210 20)',
	'rgb(240 210 20)',
	'rgb(240 210 20)',
	'rgb(240 210 20)',
	'rgb(100 100 110)'
];
let dotColours = [
	'rgb(255, 255, 255)', 
	'rgb(20, 40, 30)', 
	'rgb(255, 128, 0)', 
	'rgb(249, 226, 15)',
	'rgb(200 40 60)',
	'null',
	'null',
	'null',
	'null'
];

/* ---------- Control definitions ----------
 * `key` maps to a property on `settings`. min/max are also used to clamp values
 * before they reach the simulation, so typing nonsense into a number box is harmless.
 */
const CONTROL_GROUPS = Object.freeze([
    {
        title: 'Flocking',
        controls: [
            { key: 'alignment',        label: 'Alignment',        min: 0,  max: 3,   step: 0.05 },
            { key: 'cohesion',         label: 'Cohesion',         min: 0,  max: 3,   step: 0.05 },
            { key: 'separation',       label: 'Separation',       min: 0,  max: 5,   step: 0.05 },
            { key: 'border',           label: 'Border avoidance', min: 0,  max: 3,   step: 0.05 },
        ],
    },
    {
        title: 'Perception',
        toggle: { key: 'showView', label: 'Show view' },
        controls: [
            { key: 'neighbourRadius',  label: 'Neighbour radius',   min: 10, max: 200, step: 1, unit: 'px' },
            { key: 'separationRatio',  label: 'Personal space',     min: 10, max: 100, step: 1, unit: '%' },
            { key: 'viewAngle',        label: 'View angle (± from heading)', min: 10, max: 180, step: 1, unit: '°' },
        ],
    },
    {
        title: 'School',
        controls: [
            { key: 'count',            label: 'Fish count',       min: 1,   max: 50,  step: 1 },
            { key: 'fishScale',        label: 'Fish size',        min: 0.5, max: 3,   step: 0.05 },
            { key: 'speed',            label: 'Simulation speed', min: 0.1, max: 3,   step: 0.05, unit: '×' },
        ],
    }
])

const LIMITS = {}
CONTROL_GROUPS.forEach(g => g.controls.forEach(c => { LIMITS[c.key] = c }))

const PALETTES = Object.freeze([
    { value: 'koi',     label: 'Koi mix' },
    { value: 'white',   label: 'All white' },
    { value: 'orange',  label: 'All orange' },
    { value: 'gold',    label: 'All gold' },
    { value: 'rainbow', label: 'Rainbow' },
    { value: 'custom',  label: 'Custom colour' },
])

function defaultSettings() {
    return {
        // Flocking (original constants)
        alignment: 0.7,
        cohesion: 0.9,
        separation: 2,
        border: 0.8,
        // Perception
        neighbourRadius: 50,
        separationRatio: 70,          // separation radius as % of neighbour radius
        viewAngle: 90,               // degrees either side of heading (Math.PI / 1.5)
        showView: false,              // debug overlay: separation circle + view arc per fish
        // School
        count: Math.max(6, Math.min(25, Math.round(window.innerWidth / 90))),
        speed: 1,
        // Look
        fishScale: 1.5,               // extra per-fish scale, applied around each fish's centre
        palette: 'koi',
        customColour: '#ff8000',
    }
}

export default {
    name: 'boids-game',
    components: { SiteNav },
    props: {
    },
    // Only what the template needs. Everything the animation loop touches is non-reactive.
    data: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
        settings: defaultSettings(),
        panelOpen: true,
        paused: false,
        controlGroups: CONTROL_GROUPS,
        paletteOptions: PALETTES,
    }),
    computed: {
    },
    watch: {
        // Cheap tuning values: refresh the cached params and redraw (needed while paused)
        settings: {
            deep: true,
            handler() {
                this.applySettings()
                if (this.ctx) this.render()
            },
        },
        'settings.count'() {
            this.resizeSchool()
        },
        'settings.palette'() {
            this.assignColours()
            this.render()
        },
        'settings.customColour'() {
            if (this.settings.palette === 'custom') {
                this.assignColours()
                this.render()
            }
        },
    },
    created() {
        this.fish = []
        this.ctx = null
        this.canvasWidth = 0
        this.canvasHeight = 0
        this.worldWidth = 0
        this.worldHeight = 0
        this.raf = 0
        this.lastFrame = 0
        this.accumulator = 0
        this.resizeTimer = 0
        this.reduceMotion = false
        this.params = {}             // plain-object cache of the settings, read in the hot loop
        this.applySettings()
    },
    mounted() {
        this.ctx = this.$refs.boidsCanvas.getContext('2d')
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        window.addEventListener('resize', this.onResize)

        this.resize()

        if (!this.reduceMotion) {
            this.lastFrame = performance.now()
            this.raf = requestAnimationFrame(this.frame)
        }
    },
    beforeUnmount() {
        cancelAnimationFrame(this.raf)
        clearTimeout(this.resizeTimer)
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        /* ---------- Settings ---------- */
        clamped(key) {
            const limit = LIMITS[key]
            const value = Number(this.settings[key])
            if (!Number.isFinite(value)) return defaultSettings()[key]
            return Math.min(limit.max, Math.max(limit.min, value))
        },
        // Copies the (reactive) settings into a plain object with the derived values the
        // simulation needs, so the per-pair loop never touches a Vue proxy.
        applySettings() {
            const neighbourRadius = this.clamped('neighbourRadius')
            const separationRadius = neighbourRadius * this.clamped('separationRatio') / 100
            const viewAngleRad = this.clamped('viewAngle') * Math.PI / 180
            const angleCos = Math.cos(viewAngleRad)

            this.params = {
                neighbourRadius,
                neighbourRadiusSquared: neighbourRadius * neighbourRadius,
                separationRadius,
                viewAngleRad,
                showView: !!this.settings.showView,
                separationRadiusSquared: separationRadius * separationRadius,
                angleCos,
                angleCosSquared: angleCos * angleCos,
                alignment: this.clamped('alignment'),
                cohesion: this.clamped('cohesion'),
                separation: this.clamped('separation'),
                border: this.clamped('border'),
                fishScale: this.clamped('fishScale'),
                stepMs: 1000 / (BASE_UPDATE_HZ * this.clamped('speed')),
            }
        },
        resetSettings() {
            Object.assign(this.settings, defaultSettings())
        },

        /* ---------- Setup ---------- */
        onResize() {
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(this.resize, RESIZE_DEBOUNCE)
        },
        resize() {
            this.width = window.innerWidth
            this.height = window.innerHeight

            const canvas = this.$refs.boidsCanvas
            this.canvasWidth = Math.round(this.width * RENDER_SCALE)
            this.canvasHeight = Math.round(this.height * RENDER_SCALE)
            canvas.width = this.canvasWidth
            canvas.height = this.canvasHeight
            canvas.style.width = `${this.width}px`
            canvas.style.height = `${this.height}px`

            this.worldWidth = this.width / DRAW_SCALE
            this.worldHeight = this.height / DRAW_SCALE

            this.createSchool()
        },
        createSchool() {
            if (!this.ctx) return
            this.fish = createKoiSchool(this.ctx, this.worldWidth, this.worldHeight, Math.round(this.clamped('count')))
            this.assignColours()

            // With reduced motion or while paused there's no stepping, so draw a still frame
            this.render()
        },
        resizeSchool() {
            let numFish = Math.round(this.clamped('count'))
            while (this.fish.length > numFish) {
                this.fish.pop()
            }
            while (this.fish.length < numFish) {
                let newFish = createKoiFish(this.ctx, this.worldWidth, this.worldHeight)
                newFish.setBodyColour(this.bodyColourFor(this.settings.palette))
                newFish.setDotColours(dotColours)
                this.fish.push(newFish)
            }
        },
        bodyColourFor(palette) {
            switch (palette) {
                case 'white':   return 'rgb(255, 255, 255)'
                case 'orange':  return 'rgb(255, 128, 0)'
                case 'gold':    return 'rgb(240, 210, 20)'
                case 'rainbow': return `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
                case 'custom':  return this.settings.customColour
                default:        return bodyColours[Math.floor(Math.random() * bodyColours.length)]
            }
        },
        assignColours() {
            const palette = this.settings.palette
            for (let f = 0; f < this.fish.length; f += 1) {
                this.fish[f].setBodyColour(this.bodyColourFor(palette))
                this.fish[f].setDotColours(dotColours)
            }
        },

        /* ---------- Animation loop ---------- */
        frame(now) {
            this.raf = requestAnimationFrame(this.frame)

            if (this.paused) {
                this.lastFrame = now
                this.accumulator = 0
                return
            }

            // Fixed timestep: the simulation advances at a fixed rate whether the display runs
            // at 60, 120 or 144Hz, and a throttled or backgrounded tab can't cause a jump.
            const stepMs = this.params.stepMs
            this.accumulator += Math.min(now - this.lastFrame, 100)
            this.lastFrame = now

            let steps = 0
            while (this.accumulator >= stepMs - 1 && steps < MAX_STEPS_PER_FRAME) {
                this.step()
                this.accumulator -= stepMs
                steps += 1
            }
            if (steps === MAX_STEPS_PER_FRAME) this.accumulator = 0

            // Only redraw when something actually moved
            if (steps > 0) this.render()
        },
        step() {
            const fish = this.fish
            const count = fish.length
            const p = this.params

            for (let first = 0; first < count; first += 1) {
                for (let second = first + 1; second < count; second += 1) {
                    this.flockTo(fish[first], fish[second])
                    this.flockTo(fish[second], fish[first])
                }
            }

            for (let i = 0; i < count; i += 1) {
                this.applyFlocking(fish[i])
                fish[i].resetFlocking()
                fish[i].avoidBorder(this.worldWidth, this.worldHeight, p.border)
                fish[i].update(this.worldWidth, this.worldHeight, p.border)
            }

        },
        flockTo(actor, neighbour) {
            const p = this.params
            const dx = neighbour.x - actor.x
            const dy = neighbour.y - actor.y
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared === 0 || distanceSquared >= p.neighbourRadiusSquared) return

            actor.neighbourCount += 1
            const viewDot = dx * actor.velocityX + dy * actor.velocityY
            const viewDotSquared = viewDot * viewDot
            const withinView = p.angleCos >= 0
                ? viewDot >= 0
                    && viewDotSquared >= p.angleCosSquared * distanceSquared * actor.velocitySquared
                : viewDot >= 0
                    || viewDotSquared <= p.angleCosSquared * distanceSquared * actor.velocitySquared

            if (withinView) {
                actor.alignmentX += neighbour.velocityX
                actor.alignmentY += neighbour.velocityY
                actor.cohesionX += neighbour.x
                actor.cohesionY += neighbour.y
            }

            if (distanceSquared <= p.separationRadiusSquared) {
                const distance = Math.sqrt(distanceSquared)
                actor.separationCount += 1
                const magnitude = p.neighbourRadius - distance
                actor.separationX -= magnitude * dx / distance
                actor.separationY -= magnitude * dy / distance
            }
        },
        
        applyFlocking(actor) {
            if (actor.neighbourCount === 0) return
            const p = this.params
            this.applyAlignment(
                actor, 
                actor.alignmentX / actor.neighbourCount, 
                actor.alignmentY / actor.neighbourCount, 
                p.alignment
            )
            this.applyCohesion(
                actor, 
                actor.cohesionX / 
                actor.neighbourCount, 
                actor.cohesionY / actor.neighbourCount, 
                p.cohesion
            )

            if (actor.separationCount > 0) {
                this.applySeparation(
                    actor, 
                    actor.separationX / actor.separationCount, 
                    actor.separationY / actor.separationCount, 
                    p.separation
                )
            }
        },

        applyAlignment(actor, x, y, scale) {
            actor.addForce(x - actor.velocityX, y - actor.velocityY, scale)
        },

        applyCohesion(actor, x, y, scale) {
            actor.addForce(x - actor.x - actor.velocityX, y - actor.y - actor.velocityY, scale)
        },

        applySeparation(actor, x, y, scale) {
            actor.addForce(x - actor.velocityX, y - actor.velocityY, scale)
        },

        render() {
            const ctx = this.ctx
            if (!ctx) return
            const fish = this.fish
            const base = RENDER_SCALE * DRAW_SCALE
            const scale = base * this.params.fishScale
            const offset = base - scale

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

            if (this.params.showView) this.drawViewOverlay()

            for (let i = 0; i < fish.length; i += 1) {
                const f = fish[i]
                ctx.save()
                // One matrix instead of translate/scale/translate: scales by FISH_SCALE around the fish
                ctx.setTransform(scale, 0, 0, scale, offset * f.x, offset * f.y)
                f.draw()
                f.drawDots()
                ctx.restore()
            }

        },

        // Debug overlay. Drawn in world units (not FISH_SCALE'd), because the radii are
        // simulation distances and shouldn't change when the fish are drawn bigger.
        drawViewOverlay() {
            const ctx = this.ctx
            const p = this.params
            const fish = this.fish
            const base = RENDER_SCALE * DRAW_SCALE

            ctx.save()
            ctx.setTransform(base, 0, 0, base, 0, 0)
            ctx.lineWidth = 1.5 / base       // ~1.5 device pixels whatever DRAW_SCALE is
            ctx.fillStyle = 'transparent'

            for (let i = 0; i < fish.length; i += 1) {
                const f = fish[i]
                const heading = Math.atan2(f.velocityY, f.velocityX)

                // Separation radius: full circle, red
                ctx.strokeStyle = 'rgb(255, 70, 70)'
                ctx.beginPath()
                ctx.arc(f.x, f.y, p.separationRadius, 0, Math.PI * 2)
                ctx.stroke()

                // View: arc of the neighbour radius, ± viewAngle either side of heading, green
                ctx.strokeStyle = 'rgb(70, 230, 100)'
                ctx.beginPath()
                ctx.moveTo(f.x, f.y)
                ctx.arc(f.x, f.y, p.neighbourRadius, heading - p.viewAngleRad, heading + p.viewAngleRad)
                ctx.lineTo(f.x, f.y)
                ctx.stroke()
            }

            ctx.restore()
        }
    },
}
</script>

<style lang="scss">
@use '../../assets/variables.scss' as *;

#boids-background {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background: radial-gradient(circle, #022c38 0%, $bg-dark-blue 100%);

    .boids-canvas {
        z-index: 1;
        pointer-events: none;
        filter: blur(1px);
        opacity: 0.7;
        // filter + opacity are bound inline from the controls panel
    }
}

// Fills whatever space is left under the nav (assumes .page is a column flex container).
// overflow: hidden stops the closed, translated panel from causing horizontal scroll.
.panel-area {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    pointer-events: none;
}

.boids-panel {
    --panel-width: 320px;
    --panel-accent: #5fd0e6;

    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(var(--panel-width), calc(100% - 48px));
    z-index: 50;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    pointer-events: none;            // only the toggle and open panel catch clicks

    &.open {
        transform: translateX(0);

        .panel-body { pointer-events: auto; }
    }

    .panel-toggle {
        position: absolute;
        top: 12px;
        right: 100%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-right: none;
        border-radius: 8px 0 0 8px;
        background: rgba(4, 30, 40, 0.85);
        color: #fff;
        cursor: pointer;
        pointer-events: auto;
        backdrop-filter: blur(8px);

        &:hover { background: rgba(10, 50, 65, 0.95); }
        &:focus-visible { outline: 2px solid var(--panel-accent); outline-offset: -2px; }
    }

    .panel-body {
        height: 100%;
        overflow-y: auto;
        padding: 16px 18px 32px;
        box-sizing: border-box;
        background: rgba(4, 30, 40, 0.5);
        border-left: 1px solid rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        color: #e8f4f7;
        font-size: 0.85rem;
    }

    .panel-header h2 {
        margin: 0 0 12px;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .panel-group {
        margin-top: 18px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.12);

        h3 {
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--panel-accent);
        }

        .group-head {
            position: relative;
            display: flex;
            justify-content: center;      // heading stays centred
            align-items: center;
            margin-bottom: 10px;

            h3 { margin: 0; text-align: center; }
        }

        .icon-toggle {
            position: absolute;           // out of flow, so it doesn't push the heading off-centre
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            padding: 4px;
            border: none;
            border-radius: 6px;
            background: none;
            color: inherit;
            opacity: 0.4;
            cursor: pointer;
            transition: color 0.15s, opacity 0.15s;

            &:hover { opacity: 0.7; }
            &:focus-visible { outline: 2px solid var(--panel-accent); }

            &.active {
                color: var(--panel-accent);
                opacity: 1;
            }

            // Diagonal "disabled" slash
            &::after {
                content: '';
                position: absolute;          // .icon-toggle is already positioned, so this anchors to the button
                top: 50%;
                left: 50%;
                width: 20px;
                height: 2px;               // matches the SVG stroke (2 units × 18/24 scale)
                border-radius: 1px;
                background: currentColor;
                transform: translate(-50%, -50%) rotate(45deg) scaleX(1);
                transition: transform 0.15s;
                pointer-events: none;
            }

            &.active::after {
                transform: translate(-50%, -50%) rotate(45deg) scaleX(0);   // slash shrinks away when on
            }
        }
    }

    .panel-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;

        button {
            flex: 1 1 auto;
            padding: 7px 10px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.07);
            color: inherit;
            font: inherit;
            cursor: pointer;

            &:hover { background: rgba(255, 255, 255, 0.16); }
            &:focus-visible { outline: 2px solid var(--panel-accent); }
        }
    }

    .control {
        margin-bottom: 12px;

        &.control-inline {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }

    .control-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
    }

    .control-value {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .control-unit {
        width: 1.2em;
        opacity: 0.7;
    }

    .control-number {
        width: 58px;
        padding: 2px 4px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.25);
        color: inherit;
        font: inherit;
        text-align: right;
    }

    input[type='range'] {
        width: 100%;
        accent-color: var(--panel-accent);
        cursor: pointer;
    }

    input[type='checkbox'] {
        width: 18px;
        height: 18px;
        accent-color: var(--panel-accent);
        cursor: pointer;
    }
    
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
    }

    select {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.35);
        color: inherit;
        font: inherit;
    }

    input[type='color'] {
        width: 44px;
        height: 28px;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
    }
}
</style>