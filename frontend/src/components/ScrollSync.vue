<script lang="ts">
import eventbus from '@/helpers/eventbus'

let _uuid = 0

export default {
  props: {
    proportional: Boolean,
    vertical: Boolean,
    horizontal: Boolean,
    group: String,
    style: [String, Object],
    class: String,
  },
  data() {
    return {
      uuid: _uuid++,
    }
  },
  computed: {
    className() {
      return this.class
    },
  },
  methods: {
    handleScroll(event: any) {
      window.requestAnimationFrame(() => {
        const {
          scrollTop,
          scrollHeight,
          clientHeight,
          scrollLeft,
          scrollWidth,
          clientWidth,
          offsetHeight,
          offsetWidth,
        } = event.target

        eventbus.emit('scroll-sync', {
          scrollTop,
          scrollHeight,
          clientHeight,
          scrollLeft,
          scrollWidth,
          clientWidth,
          barHeight: offsetHeight - clientHeight,
          barWidth: offsetWidth - clientWidth,
          emitter: this.uuid,
          group: this.group,
        })
      })
    },
    onSync(data: any) {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollLeft,
        scrollWidth,
        clientWidth,
        barHeight,
        barWidth,
        emitter,
        group,
      } = data

      if (emitter === this.uuid || group !== this.group) return

      // From https://github.com/okonet/react-scroll-sync
      const scrollTopOffset = scrollHeight - clientHeight
      const scrollLeftOffset = scrollWidth - clientWidth

      const { proportional, vertical, horizontal } = this

      // Calculate the actual pane height.
      const paneHeight = this.$el.scrollHeight - clientHeight
      const paneWidth = this.$el.scrollWidth - clientWidth

      // Adjust the scrollTop position of it accordingly.
      this.$el.onscroll = null

      if (vertical && scrollTopOffset > barHeight) {
        this.$el.scrollTop = proportional
          ? (paneHeight * scrollTop) / scrollTopOffset
          : scrollTop
      }

      if (horizontal && scrollLeftOffset > barWidth) {
        this.$el.scrollLeft = proportional
          ? (paneWidth * scrollLeft) / scrollLeftOffset
          : scrollLeft
      }

      window.requestAnimationFrame(() => {
        if (this.$el) {
          this.$el.onscroll = this.handleScroll
        }
      })
    },
  },
  mounted() {
    eventbus.on('scroll-sync', this.onSync)
    this.$el.onscroll = this.handleScroll
  },
  unmounted() {
    eventbus.off('scroll-sync', this.onSync)
  },
}
</script>

<template>
  <div :style="style" :class="className">
    <slot></slot>
  </div>
</template>
