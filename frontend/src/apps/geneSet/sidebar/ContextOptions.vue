<script lang="ts">
import { Form, FormItem, Switch } from 'ant-design-vue'

import SidebarItem from '@/components/SidebarItem.vue'

export default {
  components: {
    SidebarItem,
    ASwitch: Switch,
    AForm: Form,
    AFormItem: FormItem,
  },
}
</script>

<template>
  <SidebarItem title="Sequence Context Options">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
    >
      <AFormItem label="Gene density"> <ASwitch size="small" /></AFormItem>
      <AFormItem label="GC %">
        <ASwitch size="small" />
      </AFormItem>
      <AFormItem label="ACGT %">
        <ASwitch size="small" />
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>
