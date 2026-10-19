<template>
  <div class="research__showcase">
    <button class="research__showcase-trigger" type="button" :aria-label="label" @click="open">
      <img :src="poster" :alt="alt" />
      <span class="research__showcase-play" aria-hidden="true">▶</span>
    </button>

    <dialog
      ref="dialog"
      class="research__modal"
      :aria-label="label"
      @click="onDialogClick"
      @close="onClose"
    >
      <button class="research__modal-close" type="button" aria-label="Close video" @click="close">
        &times;
      </button>
      <video ref="video" controls preload="none" playsinline>
        <source :src="video" :type="videoType" />
      </video>
    </dialog>
  </div>
</template>

<script>
export default {
  name: 'video-showcase',
  props: {
    poster: { type: String, required: true },
    videoSrc: { type: String, required: true },
    alt: { type: String, default: '' },
    label: { type: String, default: 'Play video' },
    videoType: { type: String, default: 'video/mp4' }
  },
  data: () => ({
    isOpen: false
  }),
  methods: {
    open() {
      this.$refs.dialog.showModal()
      this.isOpen = true
      this.$refs.video.play().catch(() => {}) // ignore if autoplay is blocked
    },
    close() {
      this.$refs.dialog.close()
    },
    // fires for every close method (button, Esc, backdrop)
    onClose() {
      this.isOpen = false
      this.$refs.video.pause()
      this.$refs.video.currentTime = 0
    },
    // click landed on the dialog itself, i.e. the backdrop
    onDialogClick(e) {
      if (e.target === this.$refs.dialog) this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.research {
  &__showcase {
    display: flex;
    justify-content: center;
  }

  &__showcase-trigger {
    width: 100%;
    position: relative;
    display: block;
    padding: 0;
    border: 1px solid rgba(128, 189, 232, 0.35);
    border-radius: 0.75rem;
    background: none;
    cursor: pointer;
    overflow: hidden;

    img {
      margin: 0 auto;
      display: block;
      width: 100%;
      max-width: 300px;
      height: auto;
      transition: transform 0.3s ease, filter 0.3s ease;
    }

    &:hover img,
    &:focus-visible img {
      transform: scale(1.03);
      filter: brightness(0.8);
    }

    &:focus-visible {
      outline: 2px solid #80bde8;
      outline-offset: 3px;
    }
  }

  &__showcase-play {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 1.5rem;
    pointer-events: none;
  }

  &__modal {
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(90vw, 1000px);
    height: fit-content;
    max-height: 90vh;
    border: none;
    border-radius: 0.75rem;
    background: #000;
    overflow: visible;

    // closed state (also the fade-out target)
    opacity: 0;
    transition:
        opacity 0.35s ease,
        display 0.35s allow-discrete,
        overlay 0.35s allow-discrete;

    // open state
    &[open] {
        opacity: 1;

        // fade-in starting point
        @starting-style {
        opacity: 0;
        }
    }

    // backdrop fades too
    &::backdrop {
        background: rgba(0, 0, 0, 0);
        transition:
        background 0.35s ease,
        display 0.35s allow-discrete,
        overlay 0.35s allow-discrete;
    }

    &[open]::backdrop {
        background: rgba(0, 0, 0, 0.8);

        @starting-style {
        background: rgba(0, 0, 0, 0);
        }
    }

    video {
        display: block;
        width: 100%;
        height: auto;
        max-height: 85vh;
        border-radius: 0.75rem;
    }
  }

  &__modal-close {
    position: absolute;
    top: -2.5rem;
    right: 0;
    border: none;
    background: none;
    color: #fff;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
  }
}
</style>