<script lang="ts">
import { mapState } from 'pinia'
import { useConfigStore } from '@/stores/config'

import SidebarItem from '@/components/common/SidebarItem.vue'
import { Space } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import type { Nucleotide } from '@/types'
import colors from '@/assets/colors.module.scss'

export default {
  components: {
    ASpace: Space,
    SidebarItem,
  },
  computed: {
    ...mapState(useDataStore, ['annotationColors', 'annotations', 'theme']),
    ...mapState(useConfigStore, {
      configAnnotations: 'annotations',
    }),
    nucleotides(): Nucleotide[] {
      return ['A', 'C', 'G', 'T', '-']
    },
    colors() {
      return colors
    },
  },
}
</script>

<template>
  <SidebarItem title="Legend" isDefaultCollapsed>
    <ASpace direction="vertical" size="middle">
      <div>
        <h4>Nucleotides</h4>
        <ASpace align="start">
          <div class="nucleotide" v-for="nucl in nucleotides" v-bind:key="nucl">
            <div
              class="nucleotide-color"
              :style="{ background: theme.cellColors[nucl as Nucleotide] }"
            ></div>
            <div class="nucleotide-name">{{ nucl === '-' ? 'gap' : nucl }}</div>
          </div>
          <div class="nucleotide">
            <div
              class="nucleotide-color"
              :style="{ background: theme.cellColors.empty }"
            ></div>
            <div class="nucleotide-name">reference match</div>
          </div>
        </ASpace>
      </div>

      <div>
        <h4>Aggregated nucleotides</h4>
        <ASpace align="center" size="small">
          <svg viewBox="0 0 10 10" class="aggregated-nucleotide">
            <rect width="10" height="10" :fill="theme.cellColors.aggregate" />

            <polygon points="10 0 5 5 0 0 10 0" :fill="theme.cellColors.A" />
            <polygon points="10 0 10 10 5 5 10 0" :fill="theme.cellColors.C" />
            <polygon
              points="10 10 10 10 0 10 5 5 10 10"
              :fill="theme.cellColors.G"
            />
            <polygon points="5 5 0 10 0 0 0 0 5 5" :fill="theme.cellColors.T" />

            <g>
              <circle
                cx="5"
                cy="5"
                r="2.5"
                :fill="theme.cellColors['-']"
                :stroke="theme.cellColors.aggregate"
              />
            </g>
          </svg>

          <div style="line-height: 16px">
            clockwise: A, C, G, T<br />
            middle: gap
          </div>
        </ASpace>
      </div>

      <div>
        <h4>Boolean metadata</h4>
        <ASpace direction="vertical" :size="2">
          <div class="flex">
            <svg width="20" height="20">
              <circle :fill="colors['gray-8']" cx="10" cy="10" r="8" />
            </svg>
            <div>True</div>
          </div>

          <div class="flex">
            <svg width="20" height="20">
              <circle
                :stroke="colors['gray-6']"
                :fill="colors['gray-1']"
                cx="10"
                cy="10"
                r="8"
              />
            </svg>
            <div>False</div>
          </div>

          <div class="flex">
            <svg width="20" height="20">
              <circle :fill="colors['gray-6']" cx="10" cy="10" r="2" />
            </svg>
            <div>Unknown</div>
          </div>

          <div class="flex">
            <svg width="20" height="20">
              <defs>
                <pattern
                  id="diagonalHatch"
                  patternUnits="userSpaceOnUse"
                  width="4"
                  height="4"
                >
                  <path
                    d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                    :stroke="colors['gray-13']"
                    stroke-width="1"
                  ></path>
                </pattern>
              </defs>

              <circle
                fill="url(#diagonalHatch)"
                :stroke="colors['gray-6']"
                cx="10"
                cy="10"
                r="8"
              />
            </svg>
            <div>Mixed values</div>
          </div>
        </ASpace>
      </div>

      <div v-if="annotations.length !== 0">
        <h4>Annotations</h4>
        <ASpace direction="vertical" size="small">
          <div
            class="flex"
            v-for="({ label, column }, index) in configAnnotations"
            v-bind:key="column"
          >
            <div
              class="annotation-color"
              :style="{ background: annotationColors[index] }"
            ></div>
            <div>{{ label }}</div>
          </div>
        </ASpace>
      </div>
    </ASpace>
  </SidebarItem>
</template>

<style lang="scss" scoped>
@import '@/assets/colors.module.scss';

svg.aggregated-nucleotide {
  width: 32px;
  height: 32px;
  border: 1px solid $gray-6;
  vertical-align: bottom;
}

.nucleotide {
  display: flex;
  flex-direction: column;
}

.nucleotide-color {
  width: 20px;
  height: 20px;
  border: 1px solid $gray-6;
}

.nucleotide-name {
  text-align: center;
  padding-top: 8px;
  line-height: 16px;
}

.flex {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.annotation-color {
  width: 20px;
  height: 20px;
  border: 1px solid $gray-6;
}
</style>
