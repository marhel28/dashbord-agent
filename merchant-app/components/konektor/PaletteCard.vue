<!--
  PaletteCard — presentational card for a connector in the palette.

  Three visual states:
  - active: emerald ring, check badge, non-draggable (already connected)
  - idle: subtle border, draggable, hover lift, "Hubungkan" hint on hover
  - disabled: opacity-50, not-allowed cursor, "Segera Hadir" badge
-->
<template>
  <div
    class="flex items-center gap-3 p-3 rounded-xl border bg-card transition-all duration-200 select-none"
    :class="cardClasses"
    :draggable="draggable"
  >
    <!-- Icon -->
    <span
      class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      :style="{ background: `${connector.color}18`, color: connector.color }"
    >
      <Icon :name="connector.icon" class="w-4 h-4" />
    </span>

    <!-- Label + description -->
    <div class="flex-1 min-w-0">
      <p class="text-xs font-bold text-card-foreground truncate">{{ connector.label }}</p>
      <p class="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
        {{ connector.description }}
      </p>
    </div>

    <!-- Status indicator -->
    <div class="shrink-0">
      <!-- Active: check badge -->
      <Badge v-if="state === 'active'" variant="default" class="text-[9px] bg-success-bg text-success border-success-border">
        <Icon name="lucide:check" class="w-3 h-3 mr-0.5" />
        Aktif
      </Badge>
      <!-- Idle: drag hint on hover -->
      <Badge v-else-if="state === 'idle'" variant="outline" class="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
        Tarik
      </Badge>
      <!-- Disabled: coming soon -->
      <Badge v-else variant="outline" class="text-[9px] text-muted-foreground">
        Segera Hadir
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from '~/components/ui/badge.vue'
import type { ConnectorMeta } from '~/composables/useConnectors'

const props = defineProps<{
  connector: ConnectorMeta
  draggable: boolean
  state: 'active' | 'idle' | 'disabled'
}>()

const cardClasses = computed(() => {
  if (props.state === 'active') {
    return 'border-success/40 bg-success-bg/30 cursor-default'
  }
  if (props.state === 'idle') {
    return 'border-border hover:border-primary/40 hover:shadow-sm cursor-grab active:cursor-grabbing group'
  }
  // disabled
  return 'border-border opacity-50 cursor-not-allowed'
})
</script>
