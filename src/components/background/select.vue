<template>
  <div
    class="bg-select"
    :class="{ 'bg-select--active' : active}"
    @mouseenter="active = true"
    @mouseleave="active = false"
  >
        <span class="bg-select__base flex-center" v-on:click="toggleActive" :class="{ 'bg-select__base--active' : active}">
            <selectIcon class="icon"/>
        </span>
        <div v-for="(bg, index) in backgrounds" :key="index" class="bg-select__item flex-center" :class="{ 'bg-select__item--active' : active}" v-on:click="bgClick(bg.value)">
            <span class="flex-center">
                <component :is="bg.icon" class="icon"/>
            </span>
        </div>
    </div>
</template>

<script>
import selectIcon from './icons/select-icon.svg';
import constellationsIcon from './icons/constellations-icon.svg';
import fishIcon from './icons/fish-icon.svg';
import followersIcon from './icons/followers-icon.svg';
import reflectionsIcon from './icons/reflections-icon.svg';
import bambooIcon from './icons/bamboo-icon.svg';

export default {
    name: 'background-select',
    emits: ['click'],
    components: {
        selectIcon,
        constellationsIcon,
        fishIcon,
        followersIcon,
        reflectionsIcon,
        bambooIcon
    },
    props: {
        backgrounds: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
       active: false
    }),
    methods: {
        toggleActive() {
            if (window.matchMedia('(hover: none)').matches) {
                this.active = !this.active;
            }
        },
        bgClick(value) {
            this.$emit('click', value);
        }
    }
}
</script>

<style scoped lang="scss">
@use 'sass:color';
@use 'sass:math';
@use '../../assets/variables.scss' as *;

.bg-select {
    $base-size: 80px;
    $item-size: 40px;
    $node-color: $bg-dark-blue;
    $node-background: rgba($node-color, 0.4);
    $node-highlight: $soft-blue;
    $node-color-active: color.adjust($node-highlight, $lightness: 10%);
    $icon-color: rgba($light-grey, 0.75);
    $bg-color: rgba($node-color, 0.58);
    
    position: absolute;
    z-index: 100;
    bottom: 10px;
    left: 10px;

    &::before {
        content: "";
        position: absolute;
        z-index: -99;
        bottom: math.div($base-size, 2);
        left: math.div($base-size, 2);
        transform: translate(-50%, 50%);
        width: $base-size;
        height: $base-size;
        background-color: $bg-color;
        border-radius: 50%;
        backdrop-filter: blur(14px);
        transition: all 0.5s ease;
        border: 1px solid rgba(239, 239, 239, 0.12);
    }

    &--active::before {
        width: 220px;
        height: 220px;
    }

    &__base {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 99;
        background-color: $node-background;
        backdrop-filter: blur(10px);
        width: $base-size;
        height: $base-size;
        border-radius: 50%;
        border: 1px solid rgba(239, 239, 239, 0.12);
        font-size: 1.5em;
        color: $node-highlight;

        @media (min-width: 720px) {
            &:hover {
                background-color: $node-color-active;     
                .icon {
                    stroke: $node-color;
                }
            }
            &:active {
                background-color: $node-background;
                border: solid 2px $node-highlight;
                .icon {
                    stroke: $node-highlight;
                }
            }
        }
        @media (max-width: 719px) {
            &:active {
                background-color: $node-color-active;
                .icon {
                    stroke: $node-color;
                }
            }
        }
    }

    &__item {
        position: absolute;
        z-index: 0;
        background-color: $node-background;
        backdrop-filter: blur(14px);
        bottom: 15px;
        left: 15px;
        width: $item-size;
        height: $item-size;
        border-radius: 50%;
        font-size: 1.125em;
        transition: transform 0.5s ease;
        color: $node-highlight;

        @for $i from 1 to 99 {
            $translationLength: 82px;
            $rotationAngle: 28deg;

            &--active:nth-of-type(#{$i}) { 
                transform:  rotate(($i - 1.5) * $rotationAngle)
                            translateY(-$translationLength)
                            rotate(($i - 1.5) * -$rotationAngle);
            }
        }

        @media (min-width: 720px) {
            &:hover {
                background-color: $node-color-active;
                
                .icon {
                    stroke: $node-color;
                }
            }

            &:active {
                background-color: $node-background;
                border: solid 2px $node-highlight;
                
                .icon {
                    stroke: $node-highlight;
                }
            }
        }

        @media (max-width: 719px) {
            &:active {
                background-color: $node-color-active;
                
                .icon {
                    stroke: $node-color;
                }
            }
        }
    }

    .icon {
        width: 50%;
        height: 50%;
        stroke: $icon-color;
    }
}
</style>
