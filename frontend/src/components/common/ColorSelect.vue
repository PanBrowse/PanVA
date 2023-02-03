<script lang="ts">
import { GROUP_COLORS } from '@/constants'
import { CheckOutlined } from '@ant-design/icons-vue'
import {
  Button,
  Popover,
  RadioGroup,
  RadioButton,
  type RadioChangeEvent,
} from 'ant-design-vue'

export default {
  props: {
    modelValue: String,
  },
  components: {
    AButton: Button,
    APopover: Popover,
    ARadioGroup: RadioGroup,
    ARadioButton: RadioButton,
    CheckOutlined,
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    groupColors() {
      return GROUP_COLORS
    },
  },
  methods: {
    handleChange(event: RadioChangeEvent) {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value)
      this.$emit('change')
    },
  },
}
</script>

<template>
  <APopover
    placement="bottomLeft"
    trigger="click"
    overlayClassName="color-select"
  >
    <template #content>
      <ARadioGroup :value="modelValue" @change="handleChange">
        <ARadioButton
          v-for="color in groupColors"
          :value="color"
          v-bind:key="color"
          style="padding: 0 5px"
        >
          <div class="color-select__color" :style="{ background: color }">
            <CheckOutlined />
          </div>
        </ARadioButton>
      </ARadioGroup>
    </template>
    <AButton href="https://www.google.com">
      <template #icon>
        <div class="color-select__color" :style="{ background: modelValue }" />
      </template>
    </AButton>
  </APopover>
</template>

<style lang="scss">
.color-select__color {
  display: inline-block;
  vertical-align: top;
  margin-top: 5px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: white;
  text-align: center;
  border-radius: 4px;

  svg {
    visibility: hidden;
    margin-top: 3px;
    stroke: currentColor;
    stroke-width: 50;
  }
}

.color-select {
  padding-top: 0 !important;

  .ant-popover-arrow {
    display: none;
  }

  .ant-popover-inner-content {
    padding: 0;
  }

  .ant-radio-button-wrapper-checked {
    svg {
      visibility: visible;
    }
  }
}
</style>
