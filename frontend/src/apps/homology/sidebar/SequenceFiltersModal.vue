<script lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue'
import { Button, Col, Modal, Row } from 'ant-design-vue'
import { cloneDeep } from 'lodash'
import { mapState, mapWritableState } from 'pinia'

import MetadataFilters, {
  type MetadataFiltersExpose,
} from '@/components/MetadataFilters.vue'
import { useConfigStore } from '@/stores/config'
import { useHomologyStore } from '@/stores/homology'
import type { MetadataFilter } from '@/types'

export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close'],
  data() {
    return {
      filters: [] as MetadataFilter[],
    }
  },
  components: {
    AButton: Button,
    ACol: Col,
    AModal: Modal,
    ARow: Row,
    DeleteOutlined,
    MetadataFilters,
  },
  computed: {
    ...mapState(useHomologyStore, ['sequences']),
    ...mapWritableState(useHomologyStore, ['sequenceFilters']),
    sequenceMetadata() {
      const config = useConfigStore()
      return config.homology.sequenceMetadata
    },
  },
  methods: {
    optionsForColumn(column: string): string[] {
      return this.sequences.map(
        ({ metadata: { [column]: value } }) => value as string
      )
    },
    onClear() {
      this.sequenceFilters = []
      this.$emit('close')
    },
    onCancel() {
      this.$emit('close')
    },
    onSubmit() {
      const { validate } = this.$refs.filters as MetadataFiltersExpose
      validate().then(() => {
        this.sequenceFilters = this.filters
        this.$emit('close')
      })
    },
    onFiltersChange(filters: MetadataFilter[]) {
      this.filters = filters
    },
  },
  watch: {
    visible() {
      if (this.visible) {
        this.filters = cloneDeep(this.sequenceFilters)
      }
    },
  },
}
</script>

<template>
  <AModal
    title="Filter sequences"
    :width="720"
    :visible="visible"
    @cancel="onCancel"
  >
    <p>
      Enter one or more filters to reduce the number of displayed sequences.
      Sequences within groups are filtered as well, and groups without any
      remaining sequences after filtering will be hidden.
    </p>

    <MetadataFilters
      ref="filters"
      :metadata="sequenceMetadata"
      :optionsForColumn="optionsForColumn"
      v-model="filters"
      @change="onFiltersChange"
    />

    <template #footer>
      <ARow justify="space-between">
        <ACol>
          <AButton @click="onClear" :disabled="filters.length === 0">
            <template #icon><DeleteOutlined /></template>
            Clear filters
          </AButton>
        </ACol>

        <ACol>
          <AButton @click="onCancel">Cancel</AButton>
          <AButton type="primary" @click="onSubmit">Save changes</AButton>
        </ACol>
      </ARow>
    </template>
  </AModal>
</template>
