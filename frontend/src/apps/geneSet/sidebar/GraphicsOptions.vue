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
    ...mapWritableState(useGeneSetStore, [
      'percentageGC',
      'allSequences',
      'colorGenomes',
      'overviewArrows',
      'showTable',
      'showDetails',
      'showNotificationsDetail',
      'showNotificationsOverview',
    ]),
  },
}
</script>

<template>
  <SidebarItem title="Graphics">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
    >
      <AFormItem label="Overview arrows">
        <ASwitch size="small" v-model:checked="overviewArrows"
      /></AFormItem>
      <AFormItem label="Detail View">
        <ASwitch size="small" v-model:checked="showDetails"
      /></AFormItem>
      <AFormItem label="Table">
        <ASwitch size="small" v-model:checked="showTable"
      /></AFormItem>
      <AFormItem label="Overview Notifications">
        <ASwitch size="small" v-model:checked="showNotificationsOverview"
      /></AFormItem>
      <AFormItem label="Detail Notifications">
        <ASwitch size="small" v-model:checked="showNotificationsDetail"
      /></AFormItem>
    </AForm>
  </SidebarItem>
</template>
