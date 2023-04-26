<script lang="ts">
import {
  Button,
  Col,
  Form,
  FormItem,
  Radio,
  RadioGroup,
  Row,
  Slider,
} from 'ant-design-vue'
import { mapActions, mapWritableState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  data: () => ({
    testValue: 50,
  }),
  components: {
    AButton: Button,
    SidebarItem,
    ASlider: Slider,
    AForm: Form,
    AFormItem: FormItem,
    ARadioGroup: RadioGroup,
    ARadio: Radio,
    ARow: Row,
    ACol: Col,
  },
  methods: {
    ...mapActions(useGeneSetStore, ['changeSorting']),
  },
  computed: {
    ...mapWritableState(useGeneSetStore, [
      'linkage',
      'protein',
      'order',
      'orientation',
      'size',
      'jaccard',
      'location',
    ]),
  },
}
</script>

<template>
  <SidebarItem title="Clustering Settings">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <AFormItem label="Proteins">
        <ASlider id="protein" v-model:value="protein"> </ASlider>
      </AFormItem>
      <AFormItem label="Order">
        <ASlider id="order" v-model:value="order"> </ASlider>
      </AFormItem>
      <AFormItem label="Orientation">
        <ASlider id="orientation" v-model:value="orientation"> </ASlider>
      </AFormItem>
      <AFormItem label="Size">
        <ASlider id="size" v-model:value="size"> </ASlider>
      </AFormItem>
      <AFormItem label="Location">
        <ASlider id="location" v-model:value="location"> </ASlider>
      </AFormItem>
      <AFormItem label="Jaccard / CNV">
        <ASlider id="jaccard" v-model:value="jaccard"> </ASlider>
      </AFormItem>
      <AFormItem label="Linkage">
        <ARadioGroup v-model:value="linkage">
          <ARow type="flex">
            <ACol :span="12">
              <ARadio :value="0">Average</ARadio>
              <ARadio :value="1">Complete</ARadio>
            </ACol>
            <ACol :span="12">
              <ARadio :value="2">Single</ARadio>
              <ARadio :value="3">Ward</ARadio>
            </ACol>
          </ARow>
        </ARadioGroup>
      </AFormItem>
      <!-- <AFormItem label="Calculate"> -->
      <!-- <AButton @click="changeSorting('genome_number_asc')">
          ascending genomeNr
        </AButton>
        <AButton danger @click="changeSorting('genome_number_desc')">
          descending genomeNr
        </AButton> -->

      <!-- <AButton type="primary" ghost> Orientation </AButton>
        <AButton type="primary" ghost> Size </AButton>
        <AButton type="primary" ghost> Position </AButton>
        <AButton type="primary" ghost> Jaccard </AButton>
        <AButton type="primary" ghost> Order </AButton> -->
      <!-- </AFormItem> -->
    </AForm>
    <AForm class="cluster-options">
      <AFormItem>
        <ARow type="flex">
          <ACol :span="8"> </ACol>
          <ACol :span="16">
            <AButton type="primary" ghost @click="changeSorting('protein')">
              Generate clustering
            </AButton>

            <AButton @click="changeSorting('genome_number_asc')">
              ascending genomeNr
            </AButton>
          </ACol>
        </ARow>
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>

<style lang="scss">
.cluster-options {
  .ant-form-item {
    margin-top: 24px !important;
  }
  .ant-form-item {
    margin-bottom: 8px !important;
  }
}
</style>
