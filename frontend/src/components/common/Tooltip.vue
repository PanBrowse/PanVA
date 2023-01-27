<script lang="ts">
import { createPopper, type Instance } from '@popperjs/core'
import { useTooltipStore } from '@/stores/tooltip'
import { mapState } from 'pinia'

import TooltipContent from '@/components/common/TooltipContent.vue'

export default {
  components: {
    TooltipContent,
  },
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
    ...mapState(useTooltipStore, [
      'content',
      'data',
      'isCompact',
      'isVisible',
      'target',
      'template',
      'title',
    ]),
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
    this.popper = createPopper(this.virtualElement, this.$el, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 0],
          },
        },
      ],
    })
  },
  watch: {
    target(newTarget) {
      if (newTarget) {
        this.virtualElement.getBoundingClientRect = () => newTarget
        this.popper?.update()
      }
    },
  },
}
</script>

<template>
  <div v-show="isVisible" id="tooltip" :class="{ compact: isCompact }">
    <a-popover
      v-model:visible="isVisible"
      :title="title"
      :mouseEnterDelay="0"
      :mouseLeaveDelay="0"
      :getPopupContainer="(node: HTMLElement) => node"
      :align="{ offset: [0, 18] }"
      placement="top"
    >
      <template #content>
        <TooltipContent
          v-if="isVisible && template && data && !content"
          :template="template"
          :data="data"
        />
        <div v-if="content">{{ content }}</div>
      </template>
    </a-popover>
  </div>
</template>

<style lang="scss">
#tooltip {
  pointer-events: none;
  max-width: 400px;

  &.compact .ant-popover-inner-content {
    padding: 0;
  }
}
</style>
