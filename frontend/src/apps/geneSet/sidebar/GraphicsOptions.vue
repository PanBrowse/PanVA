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
      'overviewArrows',
      'showTable',
      'showDetails',
      'showNotificationsDetail',
      'showNotificationsOverview',
      'anchor',
      'colorGenes',
    ]),
  },
}
</script>

<template>
  <SidebarItem title="Graphics">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 16 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <h4 class="graphics">PANGENOME VIEW</h4>

      <ARow type="flex">
        <ACol :span="12"
          ><AFormItem label="Arrows">
            <ASwitch size="small" v-model:checked="overviewArrows"
          /></AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Badge">
            <ASwitch size="small" v-model:checked="showNotificationsOverview"
          /></AFormItem>
        </ACol>
      </ARow>
    </AForm>
    <AForm
      layout="horizontal"
      :labelCol="{ span: 16 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <h4 class="graphics">CHROMOSOME VIEW</h4>
      <ARow type="flex">
        <ACol :span="12">
          <AFormItem label="Detail View">
            <ASwitch size="small" v-model:checked="showDetails"
          /></AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Table">
            <ASwitch size="small" v-model:checked="showTable"
          /></AFormItem>
        </ACol>
      </ARow>
      <ARow type="flex">
        <ACol :span="12">
          <AFormItem label="Anchor gene">
            <ASwitch size="small" v-model:checked="anchor"
          /></AFormItem>
          <AFormItem label="Color genes">
            <ASwitch size="small" v-model:checked="colorGenes"
          /></AFormItem>
        </ACol>
        <ACol :span="12">
          <AFormItem label="Badge">
            <ASwitch size="small" v-model:checked="showNotificationsDetail"
          /></AFormItem>
        </ACol>
      </ARow>
    </AForm>
  </SidebarItem>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.graphics {
  color: $gray-7;
  text-align: left;
}
</style>
