<template>
    <div class="nav" :class="{'nav__active' : active}">
        <div class="nav--container">
            <div class="nav--link">
                <router-link class="flex-center" to="/">Home</router-link>
            </div>
            <div class="nav--divider" />
            <div class="nav--link">
                <router-link class="flex-center" to="/about">About</router-link>
            </div>
        </div>
        <div class="nav--trigger" :class="{'nav--trigger__active' : active}" v-on:click="active = !active">
            <span />
            <span />
        </div>
    </div>
</template>

<script>
export default {
    name: 'nav-bar',
    data: () => ({
        active: false
    })
}
</script>

<style lang="scss" scoped>
.nav {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    transform: translateY(-100%);
    transition: transform 0.25s ease;

    &:hover {
        cursor: pointer;
    }
    &__active {
        transform: translateY(0);
    }

    &--container {
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: stretch;
        background-color: rgba(20, 20, 25, 0.9);
    }
    &--link {
        width: 50%;
        height: 100%;

        a {
            font-weight: bold;
            text-decoration: none;
            color: #2c3e50;
            width: 100%;
            height: 100%;


            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }
    &--divider {
        min-width: 3px;
        height: 60%;
        background-color: #2c3e50;
        opacity: 1;
        border-radius: 99px;
    }
    &--trigger {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 30px;
        transition: height 0.25s ease;

        &:hover {
            height: 40px;
        }
        &:active span {
            background-color: #787a7c;
        }

        &::before {
            content: "";
            position: absolute;
            bottom: 0px;
            left: 50%;
            width: 100%;
            height: 200%;
            transform: translateX(-50%);
            border-radius: 50%;
            background-color: rgba(20, 20, 25, 0.9);
            box-shadow: 0px 0px 10px rgba(0, 255, 157, 0.8);
            clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
        }

        span {
            min-width: 3px;
            min-height: 15px;
            position: absolute;
            top: 25%;
            left: 50%;
            background-color: #2c3e50;
            border-radius: 99px;
            transition: transform 0.5s ease;
            
            &:nth-child(1) {
                transform: translateX(100%) rotate(45deg);
            }
            &:nth-child(2) {
                transform: translateX(-200%) rotate(-45deg);
            }
        }
        &__active span {
            &:nth-child(1) {
                transform: translateX(-50%) rotate(45deg);
            }
            &:nth-child(2) {
                transform: translateX(-50%) rotate(-45deg);
            }
        }
    }
}
</style>