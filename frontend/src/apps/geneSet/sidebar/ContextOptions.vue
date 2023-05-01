<script lang="ts">
import { Col, Form, FormItem, Row, Switch } from 'ant-design-vue'
import { mapWritableState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  components: {
    SidebarItem,
    ASwitch: Switch,
    AForm: Form,
    AFormItem: FormItem,
    ARow: Row,
    ACol: Col,
  },
  computed: {
    ...mapWritableState(useGeneSetStore, [
      'percentageGC',
      'allSequences',
      'colorGenomes',
    ]),
  },
}
</script>

<template>
  <SidebarItem title="Sequence Context">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 16 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <ARow type="flex">
        <ACol :span="12">
          <AFormItem label="All sequences">
            <ASwitch size="small" v-model:checked="allSequences"
          /></AFormItem>
          <AFormItem label="Color genomes">
            <ASwitch size="small" v-model:checked="colorGenomes"
          /></AFormItem>
          <AFormItem label="Gene density"> <ASwitch size="small" /></AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="GC %">
            <ASwitch size="small" v-model:checked="percentageGC" />
          </AFormItem>
          <AFormItem label="ACGT %">
            <ASwitch size="small" />
          </AFormItem>
        </ACol>
      </ARow>
    </AForm>
  </SidebarItem>
</template>
