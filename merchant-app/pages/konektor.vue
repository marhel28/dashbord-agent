<!--
  Konektor — Connector Hub + Architecture Map.

  Two tabs:
  - "Connector Hub" (default): interactive drag-and-drop connector management
  - "Arsitektur": existing read-only architecture map (moved from old konektor.vue)
-->
<template>
  <div class="flex flex-col h-[calc(100vh-4rem)]">
    <!-- ═══ PAGE HEADER + TABS ═══ -->
    <header class="px-4 md:px-6 py-3 border-b border-border flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-xl md:text-2xl font-bold tracking-tight text-card-foreground">Integrasi</h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Hubungkan layanan favorit Anda untuk memperkuat UMKM Copilot.
        </p>
      </div>
      <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono hidden sm:inline-flex">
        {{ activeConnectorsCount }} aktif
      </span>
    </header>

    <!-- ═══ TAB SWITCHER ═══ -->
    <div class="px-4 md:px-6 pt-3 flex gap-1 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
        :class="activeTab === tab.id
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
        @click="activeTab = tab.id"
      >
        <Icon :name="tab.icon" class="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══ TAB CONTENT ═══ -->
    <div class="flex-1 overflow-hidden">
      <!-- ── CONNECTOR HUB TAB ── -->
      <div v-show="activeTab === 'hub'" class="h-full flex flex-col md:flex-row">
        <!-- Left: Palette -->
        <ConnectorPalette class="md:w-64 shrink-0 md:h-full overflow-y-auto" />

        <!-- Center: Canvas -->
        <ConnectorCanvas class="flex-1 min-w-0" />

        <!-- Right: Panel (desktop only) -->
        <ConnectorPanel class="md:w-80 shrink-0 hidden md:flex md:flex-col" />
      </div>

      <!-- ── ARSITEKTUR TAB ── -->
      <div v-show="activeTab === 'arsitektur'" class="h-full overflow-y-auto">
        <ArsitekturMap />
      </div>
    </div>

    <!-- ═══ MOBILE DETAIL SHEET ═══ -->
    <MobileSheet
      v-if="activeTab === 'hub' && selectedNode"
      v-model:open="mobileSheetOpen"
      :title="selectedNode?.data.label"
      class="md:hidden"
    >
      <ConnectorPanel />
    </MobileSheet>

    <!-- ═══ WHATSAPP LINK DIALOG ═══ -->
    <LinkWhatsAppDialog />

    <!-- ═══ TOASTS ═══ -->
    <KonektorToasts />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MobileSheet from '~/components/mobile/MobileSheet.vue'
import ConnectorPalette from '~/components/konektor/ConnectorPalette.vue'
import ConnectorCanvas from '~/components/konektor/ConnectorCanvas.vue'
import ConnectorPanel from '~/components/konektor/ConnectorPanel.vue'
import LinkWhatsAppDialog from '~/components/konektor/LinkWhatsAppDialog.vue'
import KonektorToasts from '~/components/konektor/KonektorToasts.vue'
import ArsitekturMap from '~/components/konektor/ArsitekturMap.vue'
import { useConnectors } from '~/composables/useConnectors'

const {
  activeConnectors,
  selectedNode,
  fetchConnectors,
  selectNode,
  dispose,
} = useConnectors()

const activeConnectorsCount = computed(() => activeConnectors.value.length)

// ── Tabs ──
const tabs = [
  { id: 'hub', label: 'Connector Hub', icon: 'lucide:plug' },
  { id: 'arsitektur', label: 'Arsitektur', icon: 'lucide:network' },
]
const activeTab = ref('hub')

// ── Mobile sheet ──
const mobileSheetOpen = computed({
  get: () => !!selectedNode.value,
  set: (v: boolean) => { if (!v) selectNode(null) },
})

onMounted(fetchConnectors)
onUnmounted(dispose)
</script>
