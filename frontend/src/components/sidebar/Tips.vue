<script lang="ts">
import SidebarItem from '@/components/common/SidebarItem.vue'
import { PushpinOutlined } from '@ant-design/icons-vue'
import { TypographyText } from 'ant-design-vue'

export default {
  components: {
    ATypographyText: TypographyText,
    PushpinOutlined,
    SidebarItem,
  },
}
</script>

<template>
  <SidebarItem title="Tips" isDefaultCollapsed>
    <p>
      When selecting positions, you can use
      <ATypographyText keyboard>Shift</ATypographyText> to (de)select a range.
    </p>
    <p>
      When selecting sequences, hold
      <ATypographyText keyboard>Ctrl</ATypographyText> or
      <ATypographyText keyboard>Alt</ATypographyText> to add to the current
      selection.
    </p>
    <p>
      Tooltips with a <PushpinOutlined /> icon in the title can be pinned by
      pressing <ATypographyText keyboard>T</ATypographyText>.
    </p>
  </SidebarItem>
</template>
