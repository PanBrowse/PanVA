<script lang="ts">
import SidebarItem from '@/components/common/SidebarItem.vue'
import { PushpinOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    PushpinOutlined,
    SidebarItem,
  },
}
</script>

<template>
  <SidebarItem title="Tips" isDefaultCollapsed>
    <p>
      When selecting positions, you can use <kbd>Shift</kbd> to (de)select a
      range.
    </p>
    <p>
      When selecting sequences, hold <kbd>Ctrl</kbd> or <kbd>Alt</kbd> to add to
      the current selection.
    </p>
    <p>
      Tooltips with a <PushpinOutlined /> icon in the title can be pinned by
      pressing <kbd>T</kbd>.
    </p>
  </SidebarItem>
</template>
