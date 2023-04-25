<script lang="ts">
import { Form, FormItem, Select } from 'ant-design-vue'
import { map, sortBy } from 'lodash'
import { mapActions, mapState, mapWritableState } from 'pinia'

import SidebarItem from '@/components/SidebarItem.vue'
import { useGeneSetStore } from '@/stores/geneSet'

export default {
  components: {
    SidebarItem,
    AForm: Form,
    AFormItem: FormItem,
    ASelect: Select,
  },
  data: () => ({}),
  computed: {
    ...mapWritableState(useGeneSetStore, [
      'chromosomes',
      'numberOfChromosomes',
      'chrFocus',
    ]),
    chrOptions() {
      let arrayChromosomes = [...Array(12)].map((_, i) => ({
        //to-do: change array to data import!
        value: i + 1,
      }))
      // arrayChromosomes.push('unphased')
      return arrayChromosomes
    },
  },
  watch: {
    chromosomes() {
      // console.log('chromosomes changed', this.chromosomes.length) //to-do: change trigger draw from nr of chromosomes to chromosomes
      this.numberOfChromosomes = this.chromosomes.length
    },
  },
}
</script>

<template>
  <SidebarItem title="Filters">
    <AForm
      layout="horizontal"
      :labelCol="{ span: 10 }"
      :wrapperCol="{ span: 14 }"
      class="view-options"
    >
      <AFormItem label="Filter chromosomes">
        <ASelect
          placeholder="None"
          v-model:value="chromosomes"
          :options="chrOptions"
          mode="multiple"
          :dropdownMatchSelectWidth="false"
          showSearch
          showArrow
        />
      </AFormItem>
      <AFormItem label="Selected chromosome">
        <ASelect
          placeholder="None"
          v-model:value="chrFocus"
          :options="chrOptions"
        />
      </AFormItem>
    </AForm>
  </SidebarItem>
</template>
