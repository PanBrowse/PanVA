import { defineStore } from 'pinia'

export const useTooltipStore = defineStore('tooltip', {
  state: () => ({
    x: 0,
    y: 0,
    title: '' as any,
    content: '' as any,
    isEnabled: false,
  }),
  actions: {
    enable(content: any, title?: any) {
      this.$patch({
        title,
        content,
        isEnabled: true,
      })
    },
    disable() {
      this.$patch({
        isEnabled: false,
      })
    },
    onMouseMove(event: MouseEvent) {
      const { clientX: x, clientY: y } = event
      this.$patch({
        x,
        y,
      })
    },
  },
})
