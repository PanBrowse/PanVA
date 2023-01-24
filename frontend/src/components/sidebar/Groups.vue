<script lang="ts">
import {
  BgColorsOutlined,
  DeleteOutlined,
  PlusOutlined,
  ShrinkOutlined,
} from '@ant-design/icons-vue'

import ColorSelect from '@/components/common/ColorSelect.vue'
import SidebarItem from '@/components/common/SidebarItem.vue'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useDataStore } from '@/stores/data'
import type { Group } from '@/types'
import { GROUP_COLORS } from '@/config'
import { chain, cloneDeep, difference, map } from 'lodash'
import { arraySplice } from '@/helpers/arraySplice'

type FormGroup = Omit<Group, 'id' | 'dataIndices'>

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
    ...mapState(useDataStore, ['lastGroupId']),
    ...mapWritableState(useDataStore, ['groups', 'selectedDataIndices']),
  },
  data() {
    return {
      newGroup: null as FormGroup | null,
    }
  },
  methods: {
    ...mapActions(useDataStore, ['createGroup']),
    onCreate() {
      if (!this.newGroup) return

      this.createGroup(this.newGroup)
      this.clearSelection()
      this.newGroup = null
    },
    clearSelection() {
      this.selectedDataIndices = []
    },
    deleteGroup(index: number) {
      this.groups = arraySplice(this.groups, index, 1)
    },
    updateGroups() {
      this.groups = cloneDeep(this.groups)
    },
    toggleGroupColorized(group: Group) {
      group.isColorized = !group.isColorized
      this.updateGroups()
    },
    toggleGroupCollapsed(group: Group) {
      group.isCollapsed = !group.isCollapsed
      this.updateGroups()
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
    emptyGroup(): FormGroup {
      return {
        name: '',
        isColorized: true,
        isCollapsed: true,
        color: this.availableColor(),
      }
    },
  },
  watch: {
    selectedDataIndices() {
      if (this.selectedDataIndices.length === 0) {
        this.newGroup = null
      } else if (!this.newGroup) {
        this.newGroup = this.emptyGroup()
      }
    },
  },
}
</script>

<template>
  <SidebarItem title="Groups">
    <a-row
      type="flex"
      :gutter="4"
      style="margin-bottom: 8px"
      v-for="(group, index) in groups"
      v-bind:key="index"
    >
      <a-col flex="0 0 auto">
        <ColorSelect v-model="group.color" @change="updateGroups()" />
      </a-col>
      <!-- -->
      <a-col flex="0 0 188px">
        <a-input
          :placeholder="`Group ${group.id}`"
          v-model:value="group.name"
          :onBlur="updateGroups"
        />
      </a-col>
      <a-col flex="0 0 auto">
        <a-button
          :type="group.isColorized ? 'default' : 'text'"
          @click="toggleGroupColorized(group)"
          class="toggle"
        >
          <template #icon><BgColorsOutlined /></template>
        </a-button>
      </a-col>
      <a-col flex="0 0 auto">
        <a-button
          :type="group.isCollapsed ? 'default' : 'text'"
          @click="toggleGroupCollapsed(group)"
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
    <p style="margin-bottom: 10px">
      <span v-if="selectedDataIndices.length === 0">
        Please make a selection to create a new group.
      </span>
      <span v-if="selectedDataIndices.length === 1">
        There is 1 sequence selected &ndash;
      </span>
      <span v-if="selectedDataIndices.length > 1">
        There are {{ selectedDataIndices.length }} sequences selected &ndash;
      </span>
      <a v-if="selectedDataIndices.length !== 0" @click="clearSelection"
        >Clear selection</a
      >
    </p>

    <a-row type="flex" :gutter="4" v-if="newGroup">
      <a-col flex="0 0 auto">
        <ColorSelect v-model="newGroup.color" />
      </a-col>
      <!-- -->
      <a-col flex="1 1 auto">
        <a-input
          v-model:value="newGroup.name"
          :placeholder="`Group ${lastGroupId + 1}`"
        />
      </a-col>
      <a-col flex="0 0 auto">
        <a-button type="primary" @click="onCreate">
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
