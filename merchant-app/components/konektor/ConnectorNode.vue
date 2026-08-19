<!--
  ConnectorNode — custom VueFlow node for the Connector Hub.

  Shows connector icon, name, status badge, phone (if linked), and default tag.
  Visual states: connected (emerald), pending (amber + pulse), inactive (gray).

  Props (VueFlow convention): { data: CanvasNodeData, selected: boolean }
-->
<template>
  <div
    class="connector-node rounded-xl border-2 bg-card shadow-sm transition-all duration-200 w-[150px] cursor-pointer"
    :class="{
      'ring-2 ring-primary/40 shadow-md': selected,
      'opacity-60': data.status === 'inactive',
      'animate-pulse-subtle': data.status === 'pending',
    }"
    :style="{ borderColor: data.color }"
  >
    <!-- Connection handles -->
    <Handle type="target" position="left" class="!bg-primary" />
    <Handle type="source" position="right" class="!bg-primary" />

    <!-- Header band: icon + label -->
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-t-[10px]"
      :style="{ background: `linear-gradient(135deg, ${data.color}14, transparent)` }"
    >
      <span
        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        :style="{ background: `${data.color}22`, color: data.color }"
      >
        <Icon :name="data.icon" class="w-4 h-4" />
      </span>
      <span class="text-xs font-bold truncate text-card-foreground">{{ data.label }}</span>
    </div>

    <!-- Body: status + phone + default tag -->
    <div class="px-3 py-2 space-y-1.5">
      <div class="flex items-center justify-between">
        <Badge :variant="statusVariant" class="text-[9px]">
          <span class="w-1.5 h-1.5 rounded-full mr-1" :class="statusDotClass" />
          {{ statusLabel }}
        </Badge>
        <span
          v-if="data.isDefault"
          class="text-[9px] font-bold text-primary uppercase tracking-wide"
        >
          Default
        </span>
      </div>
      <p
        v-if="data.phone"
        class="text-[10px] text-muted-foreground font-mono truncate"
      >
        {{ data.phone }}
      </p>
    </div>

    <!-- Quick-action: Hubungkan (disconnected) or Chat (connected) -->
    <div
      v-if="data.type === 'whatsapp' && selected"
      class="px-3 pb-2"
    >
      <!-- Disconnected: show connect button -->
      <Button
        v-if="data.status === 'inactive'"
        size="sm"
        class="w-full bg-[#25D366] hover:bg-[#1DA851] text-white text-[10px] h-7"
        @click.stop="handleConnect('whatsapp')"
      >
        <Icon name="lucide:link" class="w-3 h-3" />
        Hubungkan
      </Button>
      <!-- Connected: show chat button -->
      <Button
        v-else-if="data.status === 'active'"
        size="sm"
        class="w-full bg-[#25D366] hover:bg-[#1DA851] text-white text-[10px] h-7"
        @click.stop="openCopilotChat()"
      >
        <Icon name="lucide:message-circle" class="w-3 h-3" />
        Chat Copilot
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle } from '@vue-flow/core'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import { useConnectors } from '~/composables/useConnectors'
import type { CanvasNodeData } from '~/composables/useConnectors'

const props = defineProps<{
  data: CanvasNodeData
  selected?: boolean
}>()

const { openCopilotChat, handleConnect } = useConnectors()

const statusVariant = computed(() => {
  const map: Record<string, string> = {
    active: 'default',
    pending: 'secondary',
    inactive: 'outline',
    error: 'destructive',
    expired: 'destructive',
  }
  return map[props.data.status] || 'outline'
})

const statusDotClass = computed(() => {
  const map: Record<string, string> = {
    active: 'bg-success',
    pending: 'bg-warning animate-pulse',
    inactive: 'bg-muted-foreground',
    error: 'bg-destructive',
    expired: 'bg-destructive',
  }
  return map[props.data.status] || 'bg-muted-foreground'
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    active: 'Terhubung',
    pending: 'Menghubungkan…',
    inactive: 'Terputus',
    error: 'Error',
    expired: 'Kedaluwarsa',
  }
  return map[props.data.status] || '—'
})
</script>

<style scoped>
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  border: 2px solid white;
}
</style>
