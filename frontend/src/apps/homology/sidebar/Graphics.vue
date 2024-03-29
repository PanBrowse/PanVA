<script lang="ts">
import { Form, FormItem, Select, Switch } from 'ant-design-vue'
import type { DefaultOptionType } from 'ant-design-vue/lib/select'
import { map } from 'lodash'
import { mapWritableState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { THEMES } from '@/constants'
import { useHomologyStore } from '@/stores/homology'

export default {
  components: {
    AForm: Form,
    AFormItem: FormItem,
    ASelect: Select,
    ASwitch: Switch,
    SidebarItem,
  },
  computed: {
    ...mapWritableState(useHomologyStore, [
      'highDpiEnabled',
      'selectedTheme',
      'transitionsEnabled',
    ]),
    themeOptions(): DefaultOptionType[] {
      return map(THEMES, ({ name }, key) => ({ value: key, label: name }))
    },
  },
}
</script>

<template>
  <SidebarItem title="Graphics" isDefaultCollapsed>
    <AForm
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
      class="graphics"
    >
      <AFormItem label="Color scheme">
        <ASelect
          v-model:value="selectedTheme"
          :dropdownMatchSelectWidth="false"
          :options="themeOptions"
        />
      </AFormItem>

      <AFormItem label="Transitions" extra="Disable for improved performance.">
        <ASwitch size="small" v-model:checked="transitionsEnabled" />
      </AFormItem>

      <AFormItem
        label="High DPI cells"
        extra="Disable for improved performance."
      >
        <ASwitch size="small" v-model:checked="highDpiEnabled" />
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>

<style lang="scss">
.graphics {
  .ant-form-item {
    margin-bottom: 8px;
  }
}
</style>
