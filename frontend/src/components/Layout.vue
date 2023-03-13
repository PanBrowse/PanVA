<script lang="ts">
import {
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'
import {
  Button,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Tooltip,
} from 'ant-design-vue'
import { mapActions, mapState } from 'pinia'

import { DEFAULT_TITLE } from '@/constants'
import { isMobile } from '@/helpers/mediaQueries'
import { useConfigStore } from '@/stores/config'
import { useGlobalStore } from '@/stores/global'

export default {
  slots: ['sidebar'],
  components: {
    AButton: Button,
    ALayout: Layout,
    ALayoutHeader: LayoutHeader,
    ALayoutContent: LayoutContent,
    ALayoutSider: LayoutSider,
    ATooltip: Tooltip,
    ArrowLeftOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  },
  data() {
    return {
      collapsed: isMobile(),
    }
  },
  computed: {
    ...mapState(useConfigStore, ['title']),
    ...mapState(useGlobalStore, ['currentApp', 'enabledApps']),
    hasSidebar(): boolean {
      return !!this.$slots.sidebar
    },
    isMobile(): boolean {
      return isMobile()
    },
    baseTitle(): string {
      return this.title || DEFAULT_TITLE
    },
    appTitle(): string {
      return this.currentApp?.name || ''
    },
    hasMultipleApps(): boolean {
      return this.enabledApps.length > 1
    },
  },
  methods: {
    ...mapActions(useGlobalStore, ['switchToOverview']),
    closeSidebar() {
      this.collapsed = true
    },
  },
}
</script>

<template>
  <ALayout>
    <ALayoutHeader :class="{ 'has-multiple-apps': hasMultipleApps }">
      <ATooltip
        title="Back to application overview"
        placement="bottomLeft"
        arrowPointAtCenter
        v-if="hasMultipleApps"
      >
        <AButton shape="circle" @click="switchToOverview">
          <ArrowLeftOutlined />
        </AButton>
      </ATooltip>

      <h3>
        {{ baseTitle }} <span v-if="appTitle"> - {{ appTitle }}</span>
      </h3>
      <ATooltip
        title="Toggle sidebar visibility"
        placement="bottomRight"
        arrowPointAtCenter
      >
        <AButton
          shape="circle"
          @click="() => (collapsed = !collapsed)"
          v-if="hasSidebar"
        >
          <MenuFoldOutlined v-if="collapsed" />
          <MenuUnfoldOutlined v-else />
        </AButton>
      </ATooltip>
    </ALayoutHeader>
    <ALayout :hasSider="hasSidebar">
      <ALayoutContent>
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
        <slot name="sidebar"></slot>
      </ALayoutSider>
    </ALayout>
  </ALayout>

  <div
    class="ant-sidebar-backdrop"
    :class="{ visible: !collapsed }"
    @mousedown="closeSidebar"
  ></div>
</template>

<style lang="scss" scoped>
@import '@/assets/colors.module.scss';

.ant-layout {
  height: 100vh;
}

.ant-layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  background: white;
  color: rgba(0, 0, 0, 0.85);

  height: 48px;
  line-height: 48px;
  padding: 0 8px 0 16px;

  position: relative;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.15);

  &.has-multiple-apps {
    padding: 0 8px;
  }

  h3 {
    margin: 0;
    flex: 1 1 auto;
    font-weight: normal;

    span {
      opacity: 0.6;
    }
  }
}

.ant-layout-content {
  background: none;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ant-layout-sider {
  background: white;
  overflow-y: auto;
  margin: 16px 0;

  &:not(.ant-layout-sider-collapsed) {
    /* Responsive on mobile. */
    min-width: auto !important;
    max-width: 380px !important;
    width: 90% !important;
    margin: 16px 16px 16px 0;
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

  .ant-layout-sider {
    margin: 0 !important;
  }

  .ant-sidebar-backdrop {
    display: block;
  }
}
</style>
