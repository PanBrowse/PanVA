<script lang="ts">
import { RightOutlined } from '@ant-design/icons-vue'
import { Card, CardGrid, Col, Row, TypographyText } from 'ant-design-vue'
import { mapActions, mapState } from 'pinia'

import { useConfigStore } from '@/stores/config'
import { useGlobalStore } from '@/stores/global'

export default {
  components: {
    ARow: Row,
    ACol: Col,
    ACard: Card,
    ACardGrid: CardGrid,
    ATypographyText: TypographyText,
    RightOutlined,
  },
  computed: {
    ...mapState(useGlobalStore, ['enabledApps']),
    ...mapState(useConfigStore, ['title']),
  },
  methods: {
    ...mapActions(useGlobalStore, ['switchToApp']),
  },
}
</script>

<template>
  <div class="app-select">
    <h2>{{ title }}</h2>
    <p>Please select an application to use.</p>
    <ACard>
      <ACardGrid
        @click="switchToApp(app.id)"
        v-bind:key="app.id"
        v-for="app in enabledApps"
      >
        <ARow justify="space-between" align="middle">
          <ACol>
            <h4>{{ app.name }}</h4>
            <ATypographyText>{{ app.description }}</ATypographyText>
          </ACol>
          <ACol>
            <RightOutlined />
          </ACol>
        </ARow>
      </ACardGrid>
    </ACard>
  </div>
</template>

<style lang="scss">
@import '@/assets/colors.module.scss';

.app-select {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: auto;

  color: $gray-7;

  h2 {
    margin: 0;
  }

  .anticon {
    font-size: 18px;
  }

  .ant-card {
    width: 90%;
    max-width: 540px;
    cursor: pointer;
  }

  .ant-card-grid {
    width: 100%;
  }
}
</style>
