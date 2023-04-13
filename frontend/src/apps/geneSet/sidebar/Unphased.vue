<script lang="ts">
import { WarningTwoTone } from '@ant-design/icons-vue'

import SidebarItem from '@/components/SidebarItem.vue'

export default {
  components: {
    WarningTwoTone,
    SidebarItem,
  },
}
</script>

<template>
  <SidebarItem title="Unphased Sequences">
    <template #extra><WarningTwoTone two-tone-color="#f4b400" /> </template>
    <p>
      <WarningTwoTone two-tone-color="#f4b400" /> list of mRNAs in unphased
      sequences
    </p>
  </SidebarItem>
</template>
