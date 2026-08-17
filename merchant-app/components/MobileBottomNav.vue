<template>
  <div>
    <!-- Fixed Bottom Navigation Bar (< 768px) -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 md:hidden"
      :style="{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
    >
      <NuxtLink
        to="/dashboard"
        exact-active-class="text-primary"
        class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="heroicons:rectangle-group" class="size-5" />
        <span>Beranda</span>
      </NuxtLink>

      <NuxtLink
        to="/inventory"
        exact-active-class="text-primary"
        class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="heroicons:archive-box" class="size-5" />
        <span>Stok</span>
      </NuxtLink>

      <NuxtLink
        to="/sales-report"
        exact-active-class="text-primary"
        class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="heroicons:chart-bar" class="size-5" />
        <span>Laporan</span>
      </NuxtLink>

      <NuxtLink
        to="/settings"
        exact-active-class="text-primary"
        class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="heroicons:cog-6-tooth" class="size-5" />
        <span>Pengaturan</span>
      </NuxtLink>

      <button
        type="button"
        :class="[
          'flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold uppercase tracking-wide transition-colors hover:text-foreground',
          isDrawerOpen ? 'text-primary' : 'text-muted-foreground',
        ]"
        @click="isDrawerOpen = true"
      >
        <Icon name="heroicons:ellipsis-horizontal-circle" class="size-5" />
        <span>Lainnya</span>
      </button>
    </nav>

    <!-- Navigation Drawer Sheet -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="isDrawerOpen" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" @click="isDrawerOpen = false" />
      </Transition>
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        leave-active-class="transition-transform duration-200 ease-in"
        enter-from-class="translate-y-full"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="isDrawerOpen"
          class="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-lg border-t border-border bg-card shadow-2xl md:hidden"
        >
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-2">
            <div class="h-1 w-12 rounded-full bg-border" />
          </div>

          <!-- User header -->
          <div class="flex items-center gap-3 border-b border-border p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
              {{ user?.name?.charAt(0) || 'U' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-bold text-foreground">{{ user?.name || 'Menu Navigasi' }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ user?.store_name || 'Warung Pintar' }}</p>
            </div>
          </div>

          <!-- Menu sections -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- AI Copilot -->
            <div>
              <p class="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Copilot</p>
              <nav class="space-y-1">
                <NuxtLink to="/chat" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:sparkles" class="size-4 text-primary" /><span>Asisten AI</span>
                </NuxtLink>
                <NuxtLink to="/dompet" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:wallet" class="size-4 text-primary" /><span>Dompet</span>
                </NuxtLink>
                <NuxtLink v-if="isExpert" to="/knowledge-base" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:book-open" class="size-4 text-primary" /><span>Knowledge Base</span>
                </NuxtLink>
                <NuxtLink to="/memory" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:cpu-chip" class="size-4 text-primary" /><span>Memory</span>
                </NuxtLink>
              </nav>
            </div>

            <!-- Bisnis & Operasional -->
            <div>
              <p class="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Bisnis & Operasional</p>
              <nav class="space-y-1">
                <NuxtLink v-if="showCrm" to="/customers" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:user-group" class="size-4 text-info" /><span>Pelanggan (CRM)</span>
                </NuxtLink>
                <NuxtLink to="/finance" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:currency-dollar" class="size-4 text-success" /><span>Keuangan</span>
                </NuxtLink>
                <NuxtLink to="/marketing" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:megaphone" class="size-4 text-warning" /><span>Pemasaran</span>
                </NuxtLink>
              </nav>
            </div>

            <!-- Manajemen -->
            <div>
              <p class="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Manajemen</p>
              <nav class="space-y-1">
                <NuxtLink to="/analytics" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:chart-bar" class="size-4 text-chart-5" /><span>Analitik</span>
                </NuxtLink>
                <NuxtLink to="/decision-support" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:light-bulb" class="size-4 text-warning" /><span>Keputusan</span>
                </NuxtLink>
                <NuxtLink v-if="isExpert" to="/operations" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:cog" class="size-4 text-muted-foreground" /><span>Operasional</span>
                </NuxtLink>
                <NuxtLink v-if="isExpert" to="/team" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:user-plus" class="size-4 text-info" /><span>Tim</span>
                </NuxtLink>
              </nav>
            </div>

            <!-- Sistem -->
            <div>
              <p class="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sistem</p>
              <nav class="space-y-1">
                <NuxtLink to="/automation" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:command-line" class="size-4 text-chart-5" /><span>Otomatisasi</span>
                </NuxtLink>
                <NuxtLink to="/konektor" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:puzzle-piece" class="size-4 text-warning" /><span>Konektor</span>
                </NuxtLink>
                <NuxtLink to="/documents" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:document-text" class="size-4 text-info" /><span>Dokumen</span>
                </NuxtLink>
                <NuxtLink v-if="isExpert" to="/monitoring" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:computer-desktop" class="size-4 text-destructive" /><span>Monitoring</span>
                </NuxtLink>
              </nav>
            </div>

            <!-- Akun & Bantuan -->
            <div>
              <p class="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Akun & Bantuan</p>
              <nav class="space-y-1">
                <NuxtLink to="/notifikasi" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:bell" class="size-4 text-muted-foreground" />
                  <span>Notifikasi</span>
                  <Badge v-if="unreadCount > 0" variant="default" class="ml-auto h-5 min-w-5 px-1.5 text-[10px]">{{ unreadCount > 9 ? '9+' : unreadCount }}</Badge>
                </NuxtLink>
                <NuxtLink to="/help" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:question-mark-circle" class="size-4 text-muted-foreground" /><span>Bantuan</span>
                </NuxtLink>
                <NuxtLink to="/profile" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" @click="isDrawerOpen = false">
                  <Icon name="heroicons:user-circle" class="size-4 text-muted-foreground" /><span>Profil Saya</span>
                </NuxtLink>
              </nav>
            </div>
          </div>

          <!-- Footer -->
          <div class="shrink-0 border-t border-border p-4 space-y-2">
            <Button variant="default" class="w-full btn-gradient-gold">
              <Icon name="heroicons:plus" class="size-4" />
              <span>Tingkatkan Paket</span>
            </Button>
            <Button variant="ghost" class="w-full text-destructive hover:text-destructive hover:bg-destructive-bg" @click="onLogout">
              <Icon name="heroicons:arrow-left-on-rectangle" class="size-4" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useNotificationStore } from '~/composables/useNotificationStore'
import Button from '~/components/ui/button.vue'
import Badge from '~/components/ui/badge.vue'

const route = useRoute()
const { user } = useAuth()
const { unreadCount } = useNotificationStore()

const isDrawerOpen = ref(false)

defineProps<{
  showCrm?: boolean
  isExpert?: boolean
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const onLogout = () => {
  isDrawerOpen.value = false
  emit('logout')
}

// Auto close drawer on route change
watch(() => route.path, () => {
  isDrawerOpen.value = false
})
</script>
