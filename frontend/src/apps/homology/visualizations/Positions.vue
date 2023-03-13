<script lang="ts">
import * as d3 from 'd3'
import { mapActions, mapState } from 'pinia'

import { CELL_SIZE } from '@/constants'
import { eventIndex } from '@/helpers/eventIndex'
import { useConfigStore } from '@/stores/config'
import { useHomologyStore } from '@/stores/homology'
import { useTooltipStore } from '@/stores/tooltip'

export default {
  computed: {
    ...mapState(useHomologyStore, [
      'filteredPositions',
      'filteredPositionsCount',
      'sorting',
      'variablePositions',
    ]),
    width(): number {
      return this.filteredPositionsCount * CELL_SIZE
    },
    height(): number {
      return 30
    },
    sortingPosition(): number | null {
      if (this.sorting.name === 'position') {
        return this.sorting.position
      }
      return null
    },
    variableMetadata() {
      const config = useConfigStore()
      return config.homology.variableMetadata
    },
  },
  methods: {
    ...mapActions(useHomologyStore, ['changeSorting']),
    ...mapActions(useTooltipStore, ['showTooltip', 'hideTooltip']),
    positionTransform(index: number) {
      const x = (index + 1) * CELL_SIZE - 2
      const y = this.height
      return `translate(${x},${y}) rotate(-90)`
    },
    svg() {
      return d3.select('#positions')
    },
    draw() {
      this.svg()
        .selectAll('text')
        .data(this.filteredPositions, (position) => position as number)
        .join(
          (enter) =>
            enter
              .append('text')
              .attr('transform', (position, index) =>
                this.positionTransform(index)
              )
              .on('click', (event, position) => {
                this.changeSorting({
                  name: 'position',
                  position,
                })
              })
              .text((position) => position),
          (update) =>
            update.attr('transform', (d, index) =>
              this.positionTransform(index)
            ),
          (exit) => exit.remove()
        )
        .attr('data-index', (data, index) => index)
        .attr('data-sorted', (d) => this.sortingPosition === d)
        .on('mouseover', (event) => {
          const index = eventIndex(event)
          if (index === null) return

          const position = this.filteredPositions[index]
          const variablePosition = this.variablePositions[position - 1]

          this.showTooltip({
            key: `position-${position}`,
            element: event.target,
            generateContent: () => {
              return {
                title: `Position ${position}`,
                template: `
                  <ADescriptions size="small" layout="horizontal" :column="1" bordered>
                    <ADescriptionsItem label="Variable">
                      <BooleanIndicator :value="!!variablePosition" />
                    </ADescriptionsItem>
                    <template v-if="variablePosition">
                      <ADescriptionsItem :label="metadata.label" v-for="metadata in variableMetadata" v-bind:key="metadata.column">
                        <MetadataValue
                          :metadata="metadata"
                          :value="variablePosition.metadata[metadata.column]"
                        />
                      </ADescriptionsItem>
                    </template>
                  </ADescriptions>
                `,
                data: {
                  variablePosition,
                  variableMetadata: this.variableMetadata,
                },
                isCompact: true,
                isPinnable: true,
              }
            },
          })
        })
        .on('mouseout', () => {
          this.hideTooltip()
        })
    },
  },
  mounted() {
    this.draw()
  },
  watch: {
    sortingPosition() {
      this.draw()
    },
    filteredPositions() {
      this.draw()
    },
  },
}
</script>

<template>
  <div
    class="positions-wrapper"
    :style="{
      width: width + 'px',
      height: height + 'px',
    }"
  >
    <svg id="positions" :width="width" :height="height"></svg>
  </div>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.positions-wrapper {
  .ant-checkbox-group {
    height: 10px;
    line-height: 10px;
    white-space: nowrap;
  }

  .ant-checkbox-group-item {
    white-space: nowrap;
    margin: 0;
    padding: 0 1px;
  }

  .ant-checkbox-inner {
    width: 8px;
    height: 8px;
  }

  .ant-checkbox-inner::after {
    width: 4px;
    height: 4px;
  }

  text {
    fill: $gray-7;
    font-size: 9px;
    cursor: pointer;

    &[data-sorted='true'] {
      font-weight: 500;
      fill: $gray-10;
    }

    &:hover {
      fill: $hover;
    }
  }
}
</style>
