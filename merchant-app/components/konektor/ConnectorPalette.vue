<!--
  ConnectorPalette — left sidebar with draggable connector cards.

  Two sections:
  - Terhubung: connected connectors (non-draggable, green ring)
  - Tersedia: available connectors (draggable if implemented, disabled if not)

  DnD pattern: @dragstart sets application/vueflow payload with connector type.
-->
<template>
  <div class="h-full overflow-y-auto p-3 space-y-4 border-r border-border bg-muted/30">
    <!-- Terhubung (connected) -->
    <section>
      <h3 class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
        Terhubung ({{ activeConnectors.length }})
      </h3>
      <div class="space-y-2">
        <PaletteCard
          v-for="c in activeConnectors"
          :key="c.type"
          :connector="c"
          :draggable="false"
          state="active"
        />
      </div>
    </section>

    <Separator />

    <!-- Tersedia (available) -->
    <section>
      <h3 class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
        Tersedia
      </h3>
      <div class="space-y-2">
        <PaletteCard
          v-for="c in availableConnectors"
          :key="c.type"
          :connector="c"
          :draggable="c.implemented"
          :state="c.implemented ? 'idle' : 'disabled'"
          @dragstart="onDragStart($event, c.type)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Separator from '~/components/ui/separator.vue'
import PaletteCard from './PaletteCard.vue'
import { useConnectors } from '~/composables/useConnectors'
import type { ConnectorType } from '~/composables/useConnectors'

const { activeConnectors, availableConnectors } = useConnectors()

const onDragStart = (e: DragEvent, type: ConnectorType) => {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('application/vueflow', JSON.stringify({ kind: 'connector', type }))
  e.dataTransfer.effectAllowed = 'move'
}
</script>
