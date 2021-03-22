<template>
  <div class="bg-select" :class="{ 'bg-select--active' : active}">
        <span class="bg-select__base flex-center" v-on:click="active = !active" :class="{ 'bg-select__base--active' : active}">
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
        bgClick(value) {
            this.$emit('click', value);
        }
    }
}
</script>

<style scoped lang="scss">
.bg-select {
    $base-size: 80px;
    $item-size: 40px;
    $node-color: rgb(10, 10, 30);
    $node-highlight: #00ff9d;
    $node-color-active: #83ecb3;
    $bg-color: $node-color;
    
    position: absolute;
    z-index: 97;
    bottom: 10px;
    left: 10px;

    &::before {
        content: "";
        position: absolute;
        z-index: -99;
        bottom: $base-size/2;
        left: $base-size/2;
        transform: translate(-50%, 50%);
        width: $base-size;
        height: $base-size;
        background-color: $bg-color;
        border-radius: 50%;
        transition: all 0.5s ease;
        border: solid 2px $node-highlight;
        box-shadow: 0px 0px 2px $node-highlight,
                    0px 0px 8px $node-highlight,
                    0px 0px 20px $node-highlight;
    }

    &--active::before {
        width: 230px;
        height: 230px;
    }

    &__base {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 99;
        background-color: $node-color;
        width: $base-size;
        height: $base-size;
        border-radius: 50%;
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
                background-color: $node-color;
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
        background-color: $node-color;
        bottom: 10px;
        left: 15px;
        width: $item-size;
        height: $item-size;
        border-radius: 50%;
        font-size: 1.125em;
        transition: transform 0.5s ease;
        color: $node-highlight;

        @for $i from 1 to 99 {
            $translationLength: 85px;
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
                background-color: $node-color;
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
        width: 60%;
        height: 60%;
        stroke: $node-highlight;
    }
}
</style>
