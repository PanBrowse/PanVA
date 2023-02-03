<script lang="ts">
import { createPopper, type Instance } from '@popperjs/core'
import { useTooltipStore } from '@/stores/tooltip'
import { mapActions, mapState } from 'pinia'

import { PushpinOutlined } from '@ant-design/icons-vue'

import TooltipContent from '@/components/common/TooltipContent.vue'
import { Button, Popover } from 'ant-design-vue'

export default {
  components: {
    AButton: Button,
    APopover: Popover,
    PushpinOutlined,
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
      'isPinned',
      'isPinnable',
      'isVisible',
      'target',
      'template',
      'title',
    ]),
  },
  methods: {
    ...mapActions(useTooltipStore, ['togglePinned']),
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
            offset: ({ placement }: any) => {
              if (placement === 'top') {
                return [0, -16]
              }
              return [0, 0]
            },
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
  <div
    v-show="isVisible"
    id="tooltip"
    :class="{ compact: isCompact, pinned: isPinned }"
  >
    <APopover
      v-model:visible="isVisible"
      :mouseEnterDelay="0"
      :mouseLeaveDelay="0"
      :getPopupContainer="(node: HTMLElement) => node"
    >
      <template #title>
        <AButton
          :type="isPinned ? 'primary' : 'default'"
          shape="circle"
          size="small"
          class="pushpin"
          v-if="isPinnable"
          @click="togglePinned"
        >
          <template #icon><PushpinOutlined /></template>
        </AButton>
        {{ title }}
      </template>
      <template #content>
        <TooltipContent
          v-if="isVisible && template && data && !content"
          :template="template"
          :data="data"
        />
        <div v-if="content">{{ content }}</div>
      </template>
    </APopover>
  </div>
</template>

<style lang="scss">
#tooltip {
  pointer-events: none;

  .pushpin {
    position: relative;
    left: -8px;
    margin-right: -8px;
  }

  .ant-popover {
    max-width: 400px;
  }

  .ant-popover-title {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &.pinned {
    pointer-events: all;
  }

  .ant-popover-inner-content {
    max-height: 400px;
    overflow: auto;
  }

  &.compact .ant-popover-inner-content {
    padding: 0;
  }
}
</style>
