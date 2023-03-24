<script lang="ts">
import { Table, type TableColumnsType, TypographyLink } from 'ant-design-vue'
import { mapActions, mapState } from 'pinia'
import { h } from 'vue'

import { naturalCompare, numberCompare } from '@/helpers/sorting'
import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { Homology } from '@/types'

export default {
  components: {
    ATable: Table,
  },
  computed: {
    ...mapState(useGeneSetStore, ['homologies']),
    tableColumns(): TableColumnsType {
      const columns: TableColumnsType = [
        {
          title: 'Homology id',
          dataIndex: 'id',
          key: 'id',
          fixed: true,
          sorter: (a: Homology, b: Homology) => naturalCompare(a.id, b.id),
          customRender: ({ record, text }) =>
            h(
              TypographyLink,
              { onClick: () => this.switchToHomologyApp(record.id) },
              { default: () => text }
            ),
        },
        {
          title: 'Members',
          dataIndex: 'members',
          key: 'members',
          sorter: (a: Homology, b: Homology) =>
            numberCompare(a.members, b.members),
        },
        {
          title: 'Alignment length',
          dataIndex: 'alignment_length',
          key: 'alignment_length',
          sorter: (a: Homology, b: Homology) =>
            numberCompare(a.alignment_length, b.alignment_length),
        },
      ]

      return columns
    },
  },
  methods: {
    ...mapActions(useGlobalStore, ['switchToHomologyApp']),
  },
}
</script>

<template>
  <ATable
    :columns="tableColumns"
    :dataSource="homologies"
    rowKey="id"
    size="small"
  />
</template>
