<script lang="ts">
import {
  Col,
  Row,
  Table,
  type TableColumnsType,
  TypographyLink,
} from 'ant-design-vue'
import ARow from 'ant-design-vue/lib/grid/Row'
import { mapActions, mapState } from 'pinia'
import { h } from 'vue'

import { naturalCompare, numberCompare } from '@/helpers/sorting'
import { useGeneSetStore } from '@/stores/geneSet'
import { useGlobalStore } from '@/stores/global'
import type { Homology } from '@/types'

export default {
  components: {
    ATable: Table,
    ARow: Row,
    ACol: Col,
  },
  computed: {
    ...mapState(useGeneSetStore, ['homologies', 'groupInfo']),
    tableColumns(): TableColumnsType {
      const columns: TableColumnsType = [
        {
          title: 'homology id',
          dataIndex: 'homology_id',
          key: 'homology_id',
          fixed: true,
          sorter: (a, b) => naturalCompare(a.homology_id, b.homology_id),
          customRender: ({ record, text }) =>
            h(
              TypographyLink,
              { onClick: () => this.switchToHomologyApp(record.id) },
              { default: () => text }
            ),
        },
        {
          title: 'mRNA id',
          dataIndex: 'mRNA_id',
          key: 'mRNA_id',
          sorter: (a, b) => naturalCompare(a.mRNA_id, b.mRNA_id),
        },
        {
          title: 'gene name',
          dataIndex: 'gene_name',
          key: 'mRNA_id',
          sorter: (a, b) => naturalCompare(a.gene_name, b.gene_name),
        },

        {
          title: 'genome',
          dataIndex: 'genome_number',
          key: 'mRNA_id',
          sorter: (a, b) => numberCompare(a.genome_number, b.genome_number),
        },
        {
          title: 'sequence',
          dataIndex: 'sequence_number',
          key: 'mRNA_id',
          sorter: (a, b) => numberCompare(a.sequence_number, b.sequence_number),
        },
        {
          title: 'chromosome',
          dataIndex: 'chromosome',
          key: 'mRNA_id',
          sorter: (a, b) => naturalCompare(a.chromosome, b.chromosome),
        },
        {
          title: 'strand',
          dataIndex: 'strand',
          key: 'mRNA_id',
          sorter: (a, b) => naturalCompare(a.strand, b.strand),
        },
        // {
        //   title: 'phasing chr',
        //   dataIndex: 'phasing_chromosome',
        //   key: 'phasing_chromosome',
        //   sorter: (a, b) =>
        //     naturalCompare(a.phasing_chromosome, b.phasing_chromosome),
        // },
        {
          title: 'mRNA start',
          dataIndex: 'mRNA_start_position',
          key: 'mRNA_id',
          sorter: (a, b) =>
            numberCompare(a.mRNA_start_position, b.mRNA_start_position),
        },
        {
          title: 'mRNA end',
          dataIndex: 'mRNA_end_position',
          key: 'mRNA_id',
          sorter: (a, b) =>
            numberCompare(a.mRNA_end_position, b.mRNA_end_position),
        },
        {
          title: 'mRNA length (nuc)',
          dataIndex: 'mRNA_length_nuc',
          key: 'mRNA_id',
          sorter: (a, b) => numberCompare(a.mRNA_length_nuc, b.mRNA_length_nuc),
        },
        {
          title: 'gene start',
          dataIndex: 'gene_start_position',
          key: 'mRNA_id',
          sorter: (a, b) =>
            numberCompare(a.gene_start_position, b.gene_start_position),
        },
        {
          title: 'gene end',
          dataIndex: 'gene_end_position',
          key: 'mRNA_id',
          sorter: (a, b) =>
            numberCompare(a.gene_end_position, b.gene_end_position),
        },
        {
          title: 'gene length (nuc)',
          dataIndex: 'gene_length_nuc',
          key: 'mRNA_id',
          sorter: (a, b) => numberCompare(a.gene_length_nuc, b.gene_length_nuc),
        },
        {
          title: 'CDS length (nuc)',
          dataIndex: 'cds_length_nuc',
          key: 'mRNA_id',
          sorter: (a, b) => numberCompare(a.cds_length_nuc, b.cds_length_nuc),
        },
        {
          title: 'protein length (AA)',
          dataIndex: 'protein_length_AA',
          key: 'mRNA_id',
          sorter: (a, b) =>
            numberCompare(a.protein_length_AA, b.protein_length_AA),
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
    :dataSource="groupInfo"
    rowKey="mRNA_id"
    size="small"
    :scroll="{ x: true }"
  />
</template>
