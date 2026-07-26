<template>
  <div class="automation-node trigger-node" :class="{ selected }">
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
    case 'schedule': return 'heroicons:clock'
    case 'low_stock_event': return 'heroicons:archive-box'
    case 'new_order_event': return 'heroicons:shopping-cart'
    case 'time_trigger': return 'heroicons:clock'
    default: return 'heroicons:bolt'
  }
})

const title = computed(() => {
  switch (props.data.subtype) {
    case 'schedule': return 'Jadwal'
    case 'low_stock_event': return 'Stok Rendah'
    case 'new_order_event': return 'Order Baru'
    case 'time_trigger': return 'Waktu'
    default: return 'Trigger'
  }
})

const configSummary = computed(() => {
  const c = props.data.config || {}
  switch (props.data.subtype) {
    case 'schedule':
    case 'time_trigger':
      return c.cron_description || c.cron || 'Atur cron...'
    case 'low_stock_event':
      return 'Stok di bawah minimum'
    case 'new_order_event':
      return 'Pesanan baru masuk'
    default:
      return c.label || props.data.subtype
  }
})
</script>

<style scoped>
.trigger-node {
  border-color: #3B82F6;
  background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03));
}
.trigger-node .node-header {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
}
</style>
