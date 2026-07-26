<template>
  <div class="automation-node condition-node" :class="{ selected }">
    <Handle type="target" position="left" class="node-handle" />
    <div class="node-header">
      <Icon :name="iconName" class="w-4 h-4" />
      <span class="node-title">{{ title }}</span>
    </div>
    <div class="node-body">
      <p class="node-config-summary">{{ configSummary }}</p>
    </div>
    <Handle type="source" position="right" class="node-handle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle } from '@vue-flow/core'

const props = defineProps<{
  data: {
    subtype: string
    config: Record<string, any>
  }
  selected?: boolean
}>()

const iconName = computed(() => {
  switch (props.data.subtype) {
    case 'if_stock_below': return 'heroicons:arrow-down-tray'
    case 'if_sales_above': return 'heroicons:arrow-trending-up'
    case 'if_cashflow_negative': return 'heroicons:currency-dollar'
    default: return 'heroicons:question-mark-circle'
  }
})

const title = computed(() => {
  switch (props.data.subtype) {
    case 'if_stock_below': return 'Stok Di Bawah'
    case 'if_sales_above': return 'Penjualan Di Atas'
    case 'if_cashflow_negative': return 'Arus Kas Negatif'
    default: return 'Kondisi'
  }
})

const configSummary = computed(() => {
  const c = props.data.config || {}
  switch (props.data.subtype) {
    case 'if_stock_below':
      return `< ${c.threshold || '?'} unit`
    case 'if_sales_above':
      return `> ${c.threshold_amount || '?'}`
    case 'if_cashflow_negative':
      return `Periode: ${c.period || 'monthly'}`
    default:
      return c.label || props.data.subtype
  }
})
</script>

<style scoped>
.condition-node {
  border-color: #D97706;
  background: linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.03));
  border-radius: 50%;
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.condition-node .node-header {
  background: transparent;
  color: #92400E;
  padding: 4px 8px;
  border-radius: 4px;
}
.condition-node .node-body {
  padding: 4px 8px;
}
</style>
