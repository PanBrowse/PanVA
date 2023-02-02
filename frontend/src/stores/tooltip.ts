import { defineStore } from 'pinia'

type ContentFn = () => {
  title?: string
  content?: string
  template?: string
  data?: Record<string, any>
  isCompact?: boolean
  isPinnable?: boolean
}

type TooltipParams = {
  key: string
  generateContent: ContentFn
  delay?: number
  element: HTMLElement | SVGElement
}

export const useTooltipStore = defineStore('tooltip', {
  state: () => ({
    content: '',
    data: undefined as any,
    delayTimer: null as ReturnType<typeof setTimeout> | null,
    isCompact: false,
    isPinnable: false,
    isPinned: false,
    isVisible: false,
    key: '',
    target: null as DOMRect | null,
    template: '',
    title: '',
  }),
  actions: {
    showTooltip({ key, generateContent, delay = 0.3, element }: TooltipParams) {
      // Ignore subsequent calls for the same tooltip.
      if (this.key === key) return

      // Ignore new tooltips if they are pinned.
      if (this.isPinned) return

      // New tooltip, reset any possibly running timers for old content.
      if (this.delayTimer !== null) {
        clearTimeout(this.delayTimer)
      }

      // Delay showing the tooltip. Besides improved UX, this also allows us to
      // delay generating the tooltip content which could be computationally heavy.
      const delayTimer = setTimeout(() => {
        if (!element) return
        const {
          content,
          data = {},
          isCompact = false,
          isPinnable = false,
          template,
          title = '',
        } = generateContent()
        this.$patch({
          content,
          data,
          delayTimer: null,
          isCompact,
          isPinnable,
          isVisible: true,
          target: element.getBoundingClientRect(),
          template,
          title,
        })
      }, delay * 1000)

      // Already clear any old content.
      this.$patch({
        content: '',
        data: undefined,
        delayTimer,
        isPinnable: false,
        isPinned: false,
        isVisible: false,
        key: key,
        target: null,
        template: '',
        title: '',
      })
    },
    hideTooltip() {
      // Keep showing pinned tooltip.
      if (this.isPinned) return

      if (this.delayTimer !== null) {
        clearTimeout(this.delayTimer)
      }

      this.$patch({
        delayTimer: null,
        isCompact: false,
        isPinnable: false,
        isPinned: false,
        isVisible: false,
        key: '',
        target: null,
      })
    },
    togglePinned() {
      if (this.isPinnable) {
        this.isPinned = !this.isPinned

        // No longer pinning, hide the tooltip.
        if (!this.isPinned) {
          this.hideTooltip()
        }
      }
    },
  },
})
