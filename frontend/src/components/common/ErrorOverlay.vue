<!-- eslint-disable vue/no-unused-components -->
<script lang="ts">
// import { ExclamationCircleFilled } from '@ant-design/icons-vue'
import { useDataStore } from '@/stores/data'
import { mapWritableState } from 'pinia'
import type { ModalFunc } from 'ant-design-vue/lib/modal/Modal'
import { Modal } from 'ant-design-vue'
import { h } from 'vue'

export default {
  data() {
    return {
      modal: null as ReturnType<ModalFunc> | null,
    }
  },
  computed: {
    ...mapWritableState(useDataStore, ['error']),
  },
  methods: {
    clearError() {
      this.error = null
    },
    reload() {
      window.location.reload()
    },
    showError() {
      this.modal?.destroy()

      if (!this.error) return

      if (this.error.isFatal) {
        this.modal = Modal.error({
          content: () =>
            h('div', [
              h('p', this.error?.message),
              'A reload of the application is required. If the error persists please contact your system administrator.',
            ]),
          keyboard: false,
          okButtonProps: {
            danger: true,
            ghost: false,
          },
          okText: 'Reload application',
          onOk: this.reload,
          title: 'A fatal error has occurred',
          width: 520,
        })
      } else {
        this.modal = Modal.confirm({
          cancelText: 'Reload application',
          content: () =>
            h('div', [
              h('p', this.error?.message),
              'You can continue using the application, but a reload might be required if the error persists.',
            ]),
          keyboard: false,
          okButtonProps: {
            ghost: false,
          },
          okText: 'Continue',
          onCancel: this.reload,
          onOk: this.clearError,
          title: 'An error has occurred',
          width: 520,
        })
      }
    },
  },
  mounted() {
    this.showError()
  },
  watch: {
    error() {
      this.showError()
    },
  },
  render() {
    return null
  },
}
</script>
