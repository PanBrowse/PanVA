<script lang="ts">
import { Form, FormItem, Switch } from 'ant-design-vue'
import { mapWritableState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  components: {
    SidebarItem,
    ASwitch: Switch,
    AForm: Form,
    AFormItem: FormItem,
  },
  computed: {
    ...mapWritableState(useGeneSetStore, ['percentageGC', 'allSequences']),
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
      <AFormItem label="All sequences">
        <ASwitch size="small" v-model:checked="allSequences"
      /></AFormItem>
      <AFormItem label="Gene density"> <ASwitch size="small" /></AFormItem>
      <AFormItem label="GC %">
        <ASwitch size="small" v-model:checked="percentageGC" />
      </AFormItem>
      <AFormItem label="ACGT %">
        <ASwitch size="small" />
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>
