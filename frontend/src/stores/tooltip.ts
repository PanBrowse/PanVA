import { defineStore } from 'pinia'
// import type { Component } from 'vue'

type ContentFn = () => {
  title?: string
  template: string
  data?: Record<string, any>
  isCompact?: boolean
  // components?: Record<string, Component>
}

type TooltipParams = {
  generateContent: ContentFn
  delay: number
  element: HTMLElement | SVGElement
}

export const useTooltipStore = defineStore('tooltip', {
  state: () => ({
    title: '',
    template: '',
    data: undefined as any,
    target: null as DOMRect | null,
    delayTimer: null as ReturnType<typeof setTimeout> | null,
    isVisible: false,
    isCompact: false,
  }),
  actions: {
    showTooltip({ generateContent, delay, element }: TooltipParams) {
      if (this.delayTimer !== null) {
        clearTimeout(this.delayTimer)
      }

      const delayTimer = setTimeout(() => {
        if (!element) return
        const {
          template,
          title = '',
          data = {},
          isCompact = false,
        } = generateContent()
        this.$patch({
          delayTimer: null,
          isVisible: true,
          target: element.getBoundingClientRect(),
          template,
          title,
          data,
          isCompact,
        })
      }, delay * 1000)

      this.$patch({
        title: '',
        template: '',
        data: undefined,
        target: null,
        delayTimer,
        isVisible: false,
      })
    },
    hideTooltip() {
      if (this.delayTimer !== null) {
        clearTimeout(this.delayTimer)
      }

      this.$patch({
        target: null,
        delayTimer: null,
        isVisible: false,
      })
    },
  },
})
