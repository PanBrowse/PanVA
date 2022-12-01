<script lang="ts">
import { createPopper, type Instance } from '@popperjs/core'
import { useTooltipStore } from '@/stores/tooltip'
import { mapState } from 'pinia'

export default {
  name: 'Tooltip',
  data() {
    // https://popper.js.org/docs/v2/virtual-elements/
    const virtualElement = {
      getBoundingClientRect: this.generateGetBoundingClientRect(),
    }

    return {
      virtualElement,
      popper: null as Instance | null,
    }
  },
  computed: {
    ...mapState(useTooltipStore, ['x', 'y', 'isEnabled', 'content', 'title']),
  },
  methods: {
    generateGetBoundingClientRect(x = 0, y = 0) {
      return () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
      })
    },
  },
  mounted() {
    this.popper = createPopper(this.virtualElement, this.$el)
  },
}
</script>

<template>
  <div
    v-show="isEnabled"
    class="ant-popover ant-popover-placement-top"
    id="tooltip"
  >
    <div class="ant-popover-content">
      <div class="ant-popover-arrow">
        <span class="ant-popover-arrow-content"></span>
      </div>
      <div class="ant-popover-inner" role="tooltip">
        <div class="ant-popover-title" v-if="title">
          {{ title }}
        </div>
        <div class="ant-popover-inner-content">
          {{ content }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#tooltip {
  pointer-events: none;
  max-width: 400px;
}
</style>
