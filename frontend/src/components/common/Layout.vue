<script lang="ts">
import { DEFAULT_TITLE } from '@/constants'
import { useConfigStore } from '@/stores/config'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { mapState } from 'pinia'

import {
  Button,
  Card,
  Layout,
  LayoutContent,
  LayoutSider,
} from 'ant-design-vue'
import { isMobile } from '@/helpers/mediaQueries'

export default {
  slots: ['sidebar'],
  components: {
    AButton: Button,
    ACard: Card,
    ALayout: Layout,
    ALayoutContent: LayoutContent,
    ALayoutSider: LayoutSider,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
  },
  data() {
    return {
      collapsed: isMobile(),
      defaultTitle: DEFAULT_TITLE,
    }
  },
  computed: {
    ...mapState(useConfigStore, ['title']),
    hasSidebar(): boolean {
      return !!this.$slots.sidebar
    },
    isMobile(): boolean {
      return isMobile()
    },
  },
  methods: {
    closeSidebar() {
      this.collapsed = true
    },
  },
}
</script>

<template>
  <ALayout hasSider>
    <ALayoutContent>
      <AButton
        :type="collapsed ? 'primary' : 'default'"
        class="collapse-trigger"
        shape="circle"
        @click="() => (collapsed = !collapsed)"
        v-if="hasSidebar"
      >
        <template #icon>
          <MenuFoldOutlined v-if="collapsed" />
          <MenuUnfoldOutlined v-else />
        </template>
      </AButton>

      <slot></slot>
    </ALayoutContent>

    <ALayoutSider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :collapsedWidth="0"
      :width="380"
      v-if="hasSidebar"
    >
      <ACard
        :title="title || defaultTitle"
        :bordered="false"
        style="min-height: 100%"
        :bodyStyle="{ padding: 0 }"
      >
        <slot name="sidebar"></slot>
      </ACard>
    </ALayoutSider>
  </ALayout>

  <div
    class="ant-sidebar-backdrop"
    :class="{ visible: !collapsed }"
    @mousedown="closeSidebar"
  ></div>
</template>

<style lang="scss" scoped>
.ant-layout {
  height: 100vh;
}

.ant-layout-content {
  background: none;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ant-layout-sider {
  background: none;
  overflow-y: auto;

  &:not(.ant-layout-sider-collapsed) {
    /* Responsive on mobile. */
    min-width: auto !important;
    max-width: 380px !important;
    width: 90% !important;
  }
}

.ant-sidebar-backdrop {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #000000;
  z-index: 180;
  opacity: 0;
  transition: opacity 0.2s ease-out;
  pointer-events: none;

  &.visible {
    opacity: 0.3;
    pointer-events: all;
  }
}

@media (max-device-width: 960px) {
  .ant-layout-sider {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 190;
  }

  .ant-sidebar-backdrop {
    display: block;
  }
}

.collapse-trigger {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 200;
}
</style>
