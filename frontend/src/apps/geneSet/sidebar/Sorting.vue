<script lang="ts">
import { Button, Form, FormItem, Slider } from 'ant-design-vue'
import { mapActions, mapState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  components: {
    AButton: Button,
    SidebarItem,
    ASlider: Slider,
    AForm: Form,
    AFormItem: FormItem,
  },
  methods: {
    ...mapActions(useGeneSetStore, ['changeSorting']),
  },
}
</script>

<template>
  <SidebarItem title="Sorting">
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
    </AForm>
  </SidebarItem>
</template>
