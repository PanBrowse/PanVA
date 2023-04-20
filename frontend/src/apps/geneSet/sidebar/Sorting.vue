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
    ...mapWritableState(useGeneSetStore, ['linkage']),
  },
}
</script>

<template>
  <SidebarItem title="Clustering">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 8 }"
      :wrapperCol="{ span: 16 }"
      class="view-options"
    >
      <AFormItem label="Sort sequences">
        <AButton @click="changeSorting('genome_number_asc')">
          ascending genomeNr
        </AButton>
        <AButton danger @click="changeSorting('genome_number_desc')">
          descending genomeNr
        </AButton>
        <AButton type="primary" ghost @click="changeSorting('protein')">
          Protein
        </AButton>
        <AButton type="primary" ghost> Orientation </AButton>
        <AButton type="primary" ghost> Size </AButton>
        <AButton type="primary" ghost> Position </AButton>
        <AButton type="primary" ghost> Jaccard </AButton>
        <AButton type="primary" ghost> Order </AButton>
      </AFormItem>
      <AFormItem label="Proteins">
        <ASlider id="protein" vmodel:value="ref(0)"> </ASlider>
      </AFormItem>
      <AFormItem label="Orientation">
        <ASlider id="orient" vmodel:value="ref(0)"> </ASlider>
      </AFormItem>
      <AFormItem label="Size">
        <ASlider id="size" vmodel:value="ref(0)"> </ASlider>
      </AFormItem>
      <AFormItem label="Position">
        <ASlider id="position" vmodel:value="ref(0)"> </ASlider>
      </AFormItem>
      <AFormItem label="Jaccard Index">
        <ASlider id="jaccard" vmodel:value="ref(0)"> </ASlider>
      </AFormItem>
      <AFormItem label="Order">
        <ASlider id="order" vmodel:value="ref(0)"> </ASlider>
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
    </AForm>
  </SidebarItem>
</template>
