<script lang="ts">
import SidebarItem from '@/components/common/SidebarItem.vue'

export default {
  components: {
    SidebarItem,
  },
}
</script>

<template>
  <SidebarItem title="Tips" isDefaultCollapsed>
    <p>
      When selecting positions, you can use <kbd>shift</kbd> to (de)select a
      range.
    </p>
    <p>
      When selecting sequences, hold <kbd>ctrl</kbd> to add to the current
      selection.
    </p>
  </SidebarItem>
</template>
