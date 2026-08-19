<!--
  ConnectorPanel — right detail panel for the selected connector.

  Shows connector info, status, metadata (phone, last used), and actions:
  - "Tautan Ulang" for active WhatsApp
  - "Putuskan Koneksi" for non-default connectors
  - Note for Telegram default (cannot be disconnected)
-->
<template>
  <div class="h-full overflow-y-auto p-4 space-y-4 border-l border-border bg-card">
    <!-- Empty state -->
    <div v-if="!selectedNode" class="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
      <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Icon name="lucide:mouse-pointer-click" class="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pilih Connector</p>
        <p class="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
          Klik node di kanvas untuk melihat detail & aksi.
        </p>
      </div>
    </div>

    <!-- Detail state -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-3 pb-3 border-b border-border">
        <span
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :style="{ background: `${selectedNode.data.color}22`, color: selectedNode.data.color }"
        >
          <Icon :name="selectedNode.data.icon" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h2 class="text-sm font-bold text-card-foreground truncate">
            {{ selectedNode.data.label }}
          </h2>
          <Badge :variant="statusVariant" class="text-[9px] mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full mr-1" :class="statusDotClass" />
            {{ statusLabel }}
          </Badge>
        </div>
      </div>

      <!-- Metadata -->
      <dl class="space-y-2 text-xs">
        <div class="flex justify-between">
          <dt class="text-muted-foreground">Tipe</dt>
          <dd class="font-mono text-card-foreground">{{ selectedNode.data.type }}</dd>
        </div>
        <div v-if="selectedConnector?.metadata_?.phone" class="flex justify-between">
          <dt class="text-muted-foreground">Telepon</dt>
          <dd class="font-mono text-card-foreground">{{ selectedConnector.metadata_.phone }}</dd>
        </div>
        <div v-if="selectedConnector?.metadata_?.jid" class="flex justify-between">
          <dt class="text-muted-foreground">JID</dt>
          <dd class="font-mono text-card-foreground truncate max-w-[160px]">{{ selectedConnector.metadata_.jid }}</dd>
        </div>
        <div v-if="selectedConnector?.last_used_at" class="flex justify-between">
          <dt class="text-muted-foreground">Terakhir digunakan</dt>
          <dd class="font-mono text-card-foreground">{{ formatDate(selectedConnector.last_used_at) }}</dd>
        </div>
      </dl>

      <!-- Actions -->
      <div class="space-y-2 pt-3 border-t border-border">
        <!-- Hubungkan WhatsApp (if disconnected) -->
        <Button
          v-if="selectedNode.data.type === 'whatsapp' && selectedNode.data.status === 'inactive'"
          class="w-full bg-[#25D366] hover:bg-[#1DA851] text-white"
          size="sm"
          @click="handleConnect('whatsapp')"
        >
          <Icon name="lucide:link" class="w-3.5 h-3.5" />
          Hubungkan WhatsApp
        </Button>

        <!-- Open WhatsApp Copilot chat (if connected) -->
        <Button
          v-if="selectedNode.data.type === 'whatsapp' && selectedNode.data.status === 'active'"
          class="w-full bg-[#25D366] hover:bg-[#1DA851] text-white"
          size="sm"
          @click="openCopilotChat()"
        >
          <Icon name="lucide:message-circle" class="w-3.5 h-3.5" />
          Buka WhatsApp Copilot
        </Button>

        <!-- Re-link WhatsApp if connected -->
        <Button
          v-if="selectedNode.data.type === 'whatsapp' && selectedNode.data.status === 'active'"
          variant="outline"
          size="sm"
          class="w-full"
          @click="startWhatsAppLink()"
        >
          <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
          Tautan Ulang
        </Button>

        <!-- Disconnect (NOT for default) -->
        <Button
          v-if="!selectedNode.data.isDefault"
          variant="destructive"
          size="sm"
          class="w-full"
          @click="onDisconnect()"
        >
          <Icon name="lucide:link-2-off" class="w-3.5 h-3.5" />
          Putuskan Koneksi
        </Button>

        <!-- Default note -->
        <p v-else class="text-[10px] text-muted-foreground text-center pt-2">
          Telegram adalah konektor default dan tidak dapat diputuskan.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import { useConnectors } from '~/composables/useConnectors'

const {
  selectedNode,
  selectedConnector,
  startWhatsAppLink,
  disconnectConnector,
  openCopilotChat,
  handleConnect,
} = useConnectors()

const statusVariant = computed(() => {
  const map: Record<string, string> = {
    active: 'default',
    pending: 'secondary',
    inactive: 'outline',
    error: 'destructive',
    expired: 'destructive',
  }
  return map[selectedNode.value?.data.status] || 'outline'
})

const statusDotClass = computed(() => {
  const map: Record<string, string> = {
    active: 'bg-success',
    pending: 'bg-warning animate-pulse',
    inactive: 'bg-muted-foreground',
    error: 'bg-destructive',
    expired: 'bg-destructive',
  }
  return map[selectedNode.value?.data.status] || 'bg-muted-foreground'
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    active: 'Terhubung',
    pending: 'Menghubungkan…',
    inactive: 'Terputus',
    error: 'Error',
    expired: 'Kedaluwarsa',
  }
  return map[selectedNode.value?.data.status] || '—'
})

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const onDisconnect = async () => {
  if (!selectedNode.value) return
  if (confirm(`Putuskan konektor ${selectedNode.value.data.label}?`)) {
    await disconnectConnector(selectedNode.value.data.type)
  }
}
</script>
