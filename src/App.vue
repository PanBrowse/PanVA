<script lang="ts">
import Layout from '@/components/Layout.vue'
import { mapActions, mapState } from 'pinia'
import { useDataStore } from '@/stores/data'

export default {
  name: 'App',
  components: {
    Layout,
  },
  methods: {
    ...mapActions(useDataStore, [
      'fetchHomologyIds',
      'fetchCoreSNP',
      'fetchHomology',
    ]),
  },
  computed: {
    ...mapState(useDataStore, ['homologyId']),
  },
  created() {
    Promise.all([
      this.fetchHomologyIds(),
      this.fetchCoreSNP(),
      this.fetchHomology(),
    ])
    console.log('done loading')
  },
  watch: {
    homologyId() {
      this.fetchHomology()
    },
  },
}
</script>

<template>
  <Layout />
</template>

<style>
body {
  overflow: hidden;
}

#app {
  height: 100%;
  color: #253545;
}

/**
  Bugfix for antd: plus and min icons are not shown on small buttons in Firefox.
  https://github.com/ant-design/ant-design/commit/15524df9414d3d44235674b3328fad3ef50714d1
 */
.ant-btn .anticon.anticon-plus > svg,
.ant-btn .anticon.anticon-minus > svg {
  shape-rendering: auto !important;
}
</style>
