<template>
  <div class="bg-select">
      <span class="bg-select__base flex-center" v-on:click="active = !active">BG</span>
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
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: auto;
    height: auto;

    &__base {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 99;
        background-color: #e6e934;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        font-size: 1.5em;
        border: solid 3px #e6e934;

        &:hover {
            background-color: #fdffa4;
        }
    }

    &__item {
        position: absolute;
        z-index: 98;
        background-color: #e6e934;
        bottom: 10px;
        left: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.25em;
        transition: transform 0.5s ease;

        @for $i from 1 to 99 {
            $translationLength: 100px;
            $rotationAngle: 35deg;

            &--active:nth-of-type(#{$i}) { 
                transform:  rotate(($i - 1) * $rotationAngle)
                            translateY(-$translationLength)
                            rotate(($i - 1) * -$rotationAngle);
            }
        }

        &:hover {
            background-color: #fdffa4;
        }
    }
}
</style>
