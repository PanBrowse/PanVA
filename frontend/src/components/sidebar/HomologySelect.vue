<script lang="ts">
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'
import { FilterOutlined } from '@ant-design/icons-vue'

import SidebarItem from '@/components/common/SidebarItem.vue'
import HomologySelectModal from '@/components/sidebar/HomologySelectModal.vue'
import { Button, Select, InputGroup, Tooltip } from 'ant-design-vue'
import type { DefaultOptionType } from 'ant-design-vue/lib/select'

export default {
  components: {
    AButton: Button,
    ASelect: Select,
    AInputGroup: InputGroup,
    FilterOutlined,
    ATooltip: Tooltip,
    HomologySelectModal,
    SidebarItem,
  },
  data() {
    return {
      showHomologySelectModal: false,
    }
  },
  computed: {
    ...mapState(useDataStore, [
      'homologies',
      'homologiesFiltered',
      'homologyId',
    ]),
    options(): DefaultOptionType[] {
      const options: DefaultOptionType[] = this.homologiesFiltered.map(
        (homology) => ({
          value: homology.id,
          label: homology.id,
        })
      )

      if (this.isFiltered) {
        options.push({
          value: '',
          label: 'Filters applied, not all homologies are shown.',
          disabled: true,
        })
      }

      return options
    },
    isFiltered(): boolean {
      return this.homologies.length !== this.homologiesFiltered.length
    },
  },
  methods: {
    ...mapActions(useDataStore, ['loadHomologyGroup']),
    selectHomology() {
      this.showHomologySelectModal = true
    },
    onHomologySelect(homologyId: any) {
      this.loadHomologyGroup(homologyId)
    },
    filterOption(input: string, option?: DefaultOptionType) {
      return option?.label.toLowerCase().includes(input.toLowerCase())
    },
  },
}
</script>

<template>
  <SidebarItem v-if="homologyId" title="Homology">
    <AInputGroup class="homology" compact>
      <ASelect
        showSearch
        :dropdownMatchSelectWidth="false"
        :filterOption="filterOption"
        :options="options"
        :value="homologyId"
        style="width: 100%"
        @select="onHomologySelect"
      />

      <ATooltip
        title="Filter and search homology groups"
        placement="topRight"
        arrowPointAtCenter
      >
        <AButton
          @click="selectHomology"
          :type="isFiltered ? 'primary' : 'default'"
        >
          <template #icon><FilterOutlined /></template>
        </AButton>
      </ATooltip>
    </AInputGroup>

    <HomologySelectModal
      :visible="showHomologySelectModal"
      @close="showHomologySelectModal = false"
      @select="onHomologySelect"
    />
  </SidebarItem>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.ant-input-group.homology {
  display: flex !important;

  .ant-btn-icon-only {
    padding-left: 8px;
    padding-right: 8px;
  }
}

.homology-select__filtered {
  padding: 4px 12px;
  color: $gray-7;
}
</style>
