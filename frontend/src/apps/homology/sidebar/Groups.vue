<script lang="ts">
import {
  BgColorsOutlined,
  DeleteOutlined,
  PlusOutlined,
  ShrinkOutlined,
} from '@ant-design/icons-vue'
import { Button, Col, Divider, Input, Row } from 'ant-design-vue'
import { chain, cloneDeep, difference, map } from 'lodash'
import { mapActions, mapState, mapWritableState } from 'pinia'

import ColorSelect from '@/components/ColorSelect.vue'
import SidebarItem from '@/components/SidebarItem.vue'
import { GROUP_COLORS } from '@/constants'
import { useHomologyStore } from '@/stores/homology'
import type { Group } from '@/types'

type FormGroup = Omit<Group, 'id' | 'dataIndices' | 'size'>

export default {
  components: {
    AButton: Button,
    ACol: Col,
    ADivider: Divider,
    AInput: Input,
    ARow: Row,
    BgColorsOutlined,
    ColorSelect,
    DeleteOutlined,
    PlusOutlined,
    ShrinkOutlined,
    SidebarItem,
  },
  computed: {
    ...mapState(useHomologyStore, ['lastGroupId']),
    ...mapWritableState(useHomologyStore, ['groups', 'selectedDataIndices']),
  },
  data() {
    return {
      newGroup: null as FormGroup | null,
    }
  },
  methods: {
    ...mapActions(useHomologyStore, [
      'createGroup',
      'deleteGroup',
      'expandGroup',
    ]),
    onCreate() {
      if (!this.newGroup) return

      this.createGroup(this.newGroup)
      this.newGroup = null
    },
    onDelete(id: number) {
      this.deleteGroup(id)
    },
    onExpand(id: number) {
      this.expandGroup(id)
    },
    clearSelection() {
      this.selectedDataIndices = []
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
    <ARow
      type="flex"
      :gutter="4"
      style="margin-bottom: 8px"
      v-for="group in groups"
      v-bind:key="group.id"
    >
      <ACol flex="0 0 auto">
        <ColorSelect v-model="group.color" @update:modelValue="updateGroups" />
      </ACol>
      <!-- -->
      <ACol flex="1 1 auto" style="width: min-content">
        <AInput
          :placeholder="`Group ${group.id}`"
          v-model:value="group.name"
          :onBlur="updateGroups"
        />
      </ACol>
      <ACol flex="0 0 auto">
        <AButton
          :type="group.isColorized ? 'default' : 'text'"
          @click="toggleGroupColorized(group)"
          class="toggle"
        >
          <template #icon><BgColorsOutlined /></template>
        </AButton>
      </ACol>
      <ACol flex="0 0 auto">
        <AButton
          :type="group.isCollapsed ? 'default' : 'text'"
          @click="toggleGroupCollapsed(group)"
          class="toggle"
        >
          <template #icon><ShrinkOutlined /></template>
        </AButton>
      </ACol>
      <ACol flex="0 0 auto">
        <AButton type="text" @click="onDelete(group.id)">
          <template #icon><DeleteOutlined /></template>
        </AButton>
      </ACol>
      <ACol flex="0 0 auto">
        <AButton
          type="text"
          @click="onExpand(group.id)"
          :disabled="selectedDataIndices.length === 0"
        >
          <template #icon><PlusOutlined /></template>
        </AButton>
      </ACol>
    </ARow>

    <ADivider v-if="groups.length !== 0" />

    <!-- Height should match form height. -->
    <p style="margin-bottom: 10px">
      <span v-if="selectedDataIndices.length === 0">
        Select sequences to create a new group.
      </span>
      <span v-if="selectedDataIndices.length === 1">
        There is 1 sequence selected
      </span>
      <span v-if="selectedDataIndices.length > 1">
        There are {{ selectedDataIndices.length }} sequences selected
      </span>
      <span v-if="selectedDataIndices.length !== 0">
        &ndash;
        <a @click="clearSelection">Clear selection</a>
      </span>
    </p>

    <ARow type="flex" :gutter="4" v-if="newGroup">
      <ACol flex="0 0 auto">
        <ColorSelect v-model="newGroup.color" />
      </ACol>
      <!-- -->
      <ACol flex="1 1 auto" style="width: min-content">
        <AInput
          v-model:value="newGroup.name"
          :placeholder="`Group ${lastGroupId + 1}`"
        />
      </ACol>
      <ACol flex="0 0 auto">
        <AButton type="primary" @click="onCreate">
          <template #icon><PlusOutlined /></template>
        </AButton>
      </ACol>
    </ARow>
  </SidebarItem>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.ant-btn.toggle:not(.ant-btn-text) {
  border-color: $gray-5;
  color: $gray-8;
  background: $gray-4;

  &:hover {
    border-color: $gray-6;
    color: $gray-10;
  }
}
.ant-btn-text.toggle:not(:hover) {
  color: $gray-6;
}
</style>
