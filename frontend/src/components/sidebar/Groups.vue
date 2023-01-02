<script lang="ts">
import {
  BgColorsOutlined,
  DeleteOutlined,
  PlusOutlined,
  ShrinkOutlined,
} from '@ant-design/icons-vue'

import ColorSelect from '@/components/common/ColorSelect.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import type { Group } from '@/types'
import { GROUP_COLORS } from '@/config'
import { chain, difference, map } from 'lodash'

export default {
  components: {
    BgColorsOutlined,
    ColorSelect,
    DeleteOutlined,
    PlusOutlined,
    ShrinkOutlined,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['selectedIds']),
    ...mapWritableState(useDataStore, ['groups']),
  },
  data() {
    return {
      newGroup: this.emptyGroup(),
    }
  },
  methods: {
    resetNewGroup() {
      this.newGroup = this.emptyGroup()
    },
    createGroup() {
      if (this.newGroup) {
        this.groups.push(this.newGroup)
        this.resetNewGroup()
      }
    },
    deleteGroup(index: number) {
      this.groups.splice(index, 1)
    },
    availableColor(): string {
      const taken = map(this.groups, 'color')
      const available = difference(GROUP_COLORS, taken)

      // Not all colors are taken. We pick the first available one.
      if (available.length !== 0) return available[0]

      // All colors are taken. We sort the used colors by least used, and pick the first one.
      // Since sortBy is stable, this should result in the top-most least-used color being suggested.
      return chain(taken)
        .countBy()
        .map((count, color) => ({ count, color }))
        .sortBy('-count')
        .map('color')
        .first()
        .value()
    },
    emptyGroup(): Group {
      return {
        name: '',
        isColorized: true,
        isCollapsed: true,
        ids: [],
        color: this.availableColor(),
      }
    },
  },
  mounted() {
    // Initial value set in `data` is set when dataStore is not yet available.
    // We reset it on mount to get a better color suggestion.
    this.resetNewGroup()
  },
}
</script>

<template>
  <SidebarItem title="Groups">
    <a-row
      type="flex"
      gutter="4"
      style="margin-bottom: 8px"
      v-for="(group, index) in groups"
      v-bind:key="index"
    >
      <a-col flex="0 0 auto">
        <ColorSelect v-model="group.color" />
      </a-col>
      <!-- -->
      <a-col flex="0 0 188px">
        <a-input placeholder="Name" v-model:value="group.name" />
      </a-col>
      <a-col flex="0 0 auto">
        <a-button
          :type="group.isColorized ? 'default' : 'text'"
          @click="group.isColorized = !group.isColorized"
          class="toggle"
        >
          <template #icon><BgColorsOutlined /></template>
        </a-button>
      </a-col>
      <a-col flex="0 0 auto">
        <a-button
          :type="group.isCollapsed ? 'default' : 'text'"
          @click="group.isCollapsed = !group.isCollapsed"
          class="toggle"
        >
          <template #icon><ShrinkOutlined /></template>
        </a-button>
      </a-col>
      <a-col flex="0 0 auto">
        <a-button type="text" @click="deleteGroup(index)">
          <template #icon><DeleteOutlined /></template>
        </a-button>
      </a-col>
    </a-row>

    <a-divider v-if="groups.length !== 0" />

    <!-- Height should match form height. -->
    <p style="margin-bottom: 10px" v-if="selectedIds.length === 0">
      Please make a selection to create a new group.
    </p>

    <a-row type="flex" gutter="4" v-else>
      <a-col flex="0 0 auto">
        <ColorSelect v-model="newGroup.color" />
      </a-col>
      <!-- -->
      <a-col flex="1 1 auto">
        <a-input v-model:value="newGroup.name" placeholder="Name" />
      </a-col>
      <a-col flex="0 0 auto">
        <a-button type="primary" @click="createGroup">
          <template #icon><PlusOutlined /></template>
        </a-button>
      </a-col>
    </a-row>
  </SidebarItem>
</template>

<style lang="scss">
.ant-btn.toggle:not(.ant-btn-text) {
  border-color: #d9d9d9;
  color: #525252;
  background: #f2f2f2;

  &:hover {
    border-color: #b5b5b5;
    color: #323232;
  }
}
.ant-btn-text.toggle:not(:hover) {
  color: #b5b5b5;
}
</style>
