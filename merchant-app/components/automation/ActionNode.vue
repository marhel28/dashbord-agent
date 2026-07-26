<template>
  <div class="automation-node action-node" :class="{ selected }">
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
    case 'send_report': return 'heroicons:document-text'
    case 'send_notification': return 'heroicons:bell'
    case 'update_stock': return 'heroicons:archive-box-arrow-up'
    case 'generate_pdf': return 'heroicons:document-arrow-down'
    default: return 'heroicons:play'
  }
})

const title = computed(() => {
  switch (props.data.subtype) {
    case 'send_report': return 'Kirim Laporan'
    case 'send_notification': return 'Kirim Notifikasi'
    case 'update_stock': return 'Update Stok'
    case 'generate_pdf': return 'Generate PDF'
    default: return 'Aksi'
  }
})

const configSummary = computed(() => {
  const c = props.data.config || {}
  switch (props.data.subtype) {
    case 'send_report':
      return `Laporan: ${c.report_type || 'summary'}`
    case 'send_notification':
      return c.message || 'Notifikasi...'
    case 'update_stock':
      return `${c.change_type || 'set'} ${c.quantity || ''}`
    case 'generate_pdf':
      return `Format: PDF`
    default:
      return c.label || props.data.subtype
  }
})
</script>

<style scoped>
.action-node {
  border-color: #10B981;
  background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03));
}
.action-node .node-header {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
}
</style>
