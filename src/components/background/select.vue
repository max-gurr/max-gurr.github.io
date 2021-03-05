<template>
  <div class="bg-select" :class="{ 'bg-select--active' : active}">
      <span class="bg-select__base flex-center" v-on:click="active = !active" :class="{ 'bg-select__base--active' : active}">BG</span>
      <div v-for="(bg, index) in backgrounds" :key="index" class="bg-select__item flex-center" :class="{ 'bg-select__item--active' : active}" v-on:click="bgClick(bg.value)">
          <span>{{bg.display}}</span>
      </div>
  </div>
</template>

<script>
export default {
    name: 'background-select',
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
    $bg-color: #52e293;
    $node-color: #10bd5e;
    $node-color-active: #83ecb3;
    position: absolute;
    z-index: 97;
    bottom: 10px;
    left: 10px;

    &::before {
        content: "";
        position: absolute;
        z-index: -99;
        bottom: 35px;
        left: 35px;
        transform: translate(-50%, 50%);
        width: 70px;
        height: 70px;
        background-color: $bg-color;
        opacity: 0;
        border-radius: 50%;
        transition: all 0.5s ease;
    }

    &--active::before {
        width: 250px;
        height: 250px;
        opacity: 1;
    }

    &__base {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 99;
        background-color: $node-color;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        font-size: 1.5em;
        border: solid 3px $node-color;

        &:hover {
            @media (min-width: 720px) {
                background-color: $node-color-active;
            };
        }

        &:active {
            @media (max-width: 719px) {
                background-color: $node-color-active;
            };
        }
    }

    &__item {
        position: absolute;
        z-index: 0;
        background-color: $node-color;
        bottom: 10px;
        left: 15px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.25em;
        transition: transform 0.5s ease;

        @for $i from 1 to 99 {
            $translationLength: 80px;
            $rotationAngle: 40deg;

            &--active:nth-of-type(#{$i}) { 
                transform:  rotate(($i - 1) * $rotationAngle)
                            translateY(-$translationLength)
                            rotate(($i - 1) * -$rotationAngle);
            }
        }

        &:hover {
            @media (min-width: 720px) {
                background-color: $node-color-active;
            };
        }

        &:active {
            @media (max-width: 719px) {
                background-color: $node-color-active;
            };
        }
    }
}
</style>
