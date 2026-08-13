<template>
  <div>
    <!-- ── Fixed Bottom Navigation Bar (< 768px) ── -->
    <nav
      class="fixed bottom-0 left-0 right-0 bg-[var(--wp-surface)] border-t border-[var(--wp-border)] flex items-center justify-around px-2 z-50 md:hidden"
      :style="{ height: 'calc(var(--wp-bottom-nav-height) + var(--wp-safe-area-bottom))', paddingBottom: 'var(--wp-safe-area-bottom)' }"
    >
      <!-- 1. Beranda (Dashboard) -->
      <NuxtLink to="/" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
        <span class="mobile-nav-label">Beranda</span>
      </NuxtLink>

      <!-- 2. Stok (Products) -->
      <NuxtLink to="/inventory" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:archive-box" class="w-5 h-5" />
        <span class="mobile-nav-label">Stok</span>
      </NuxtLink>

      <!-- 3. Laporan (Sales Report) -->
      <NuxtLink to="/sales-report" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:chart-bar" class="w-5 h-5" />
        <span class="mobile-nav-label">Laporan</span>
      </NuxtLink>

      <!-- 4. Pengaturan (Settings) -->
      <NuxtLink to="/settings" exact-active-class="mobile-nav-active" class="mobile-nav-link">
        <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
        <span class="mobile-nav-label">Pengaturan</span>
      </NuxtLink>

      <!-- 5. Lainnya Drawer Trigger -->
      <button @click="isDrawerOpen = true" type="button" :class="['mobile-nav-link', isDrawerOpen ? 'mobile-nav-active' : '']">
        <Icon name="heroicons:ellipsis-horizontal-circle" class="w-5 h-5" />
        <span class="mobile-nav-label">Lainnya</span>
      </button>
    </nav>

    <!-- ── Native Grouped Sheet for "Lainnya" Menu ── -->
    <MobileSheet v-model:open="isDrawerOpen" title="Menu Navigasi" :max-height="maxDrawerHeight">
      <!-- User header -->
      <div class="flex items-center gap-3 p-3 mb-3" style="background: var(--wp-bg); border-radius: var(--wp-radius-mobile);">
        <div v-if="user?.photo_profile" class="w-10 h-10 rounded-full overflow-hidden border border-[var(--wp-border)] shrink-0">
          <img :src="user.photo_profile" alt="Photo" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style="background: var(--wp-navy); color: var(--wp-gold);">
          {{ user?.name?.charAt(0) || 'U' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold truncate" style="color: var(--wp-text);">{{ user?.name || 'Menu Navigasi' }}</p>
          <p class="text-[10px] font-medium truncate" style="color: var(--wp-text-secondary);">{{ user?.store_name || 'Warung Pintar' }}</p>
        </div>
      </div>

      <!-- Section: AI Copilot -->
      <DrawerSection title="AI Copilot">
        <DrawerRow icon="heroicons:sparkles" :icon-color="`var(--wp-gold)`" label="Asisten AI" @click="navigateToRoute('/chat')" />
        <DrawerRow icon="heroicons:wallet" :icon-color="`var(--wp-gold)`" label="Dompet" @click="navigateToRoute('/dompet')" />
        <DrawerRow v-if="isExpert" icon="heroicons:book-open" :icon-color="`var(--wp-gold)`" label="Knowledge Base" @click="navigateToRoute('/knowledge-base')" />
        <DrawerRow v-if="isExpert" icon="heroicons:user-group" :icon-color="`var(--wp-gold)`" label="Toko" @click="navigateToRoute('/agents')" />
        <DrawerRow icon="heroicons:cpu-chip" :icon-color="`var(--wp-gold)`" label="Memory" @click="navigateToRoute('/memory')" />
      </DrawerSection>

      <!-- Section: Bisnis & Operasional -->
      <DrawerSection title="Bisnis & Operasional">
        <DrawerRow v-if="showCrm" icon="heroicons:user-group" icon-color="rgb(59 130 246)" label="Pelanggan (CRM)" @click="navigateToRoute('/customers')" />
        <DrawerRow icon="heroicons:currency-dollar" icon-color="rgb(16 185 129)" label="Keuangan" @click="navigateToRoute('/finance')" />
        <DrawerRow icon="heroicons:megaphone" icon-color="rgb(245 158 11)" label="Pemasaran" @click="navigateToRoute('/marketing')" />
      </DrawerSection>

      <!-- Section: Manajemen -->
      <DrawerSection title="Manajemen">
        <DrawerRow icon="heroicons:chart-bar" icon-color="rgb(168 85 247)" label="Analitik" @click="navigateToRoute('/analytics')" />
        <DrawerRow icon="heroicons:light-bulb" icon-color="rgb(234 179 8)" label="Keputusan" @click="navigateToRoute('/decision-support')" />
        <DrawerRow v-if="isExpert" icon="heroicons:cog" :icon-color="`var(--wp-text-secondary)`" label="Operasional" @click="navigateToRoute('/operations')" />
        <DrawerRow v-if="isExpert" icon="heroicons:user-plus" icon-color="rgb(20 184 166)" label="Tim" @click="navigateToRoute('/team')" />
      </DrawerSection>

      <!-- Section: Sistem -->
      <DrawerSection title="Sistem">
        <DrawerRow icon="heroicons:command-line" icon-color="rgb(99 102 241)" label="Otomatisasi" @click="navigateToRoute('/automation')" />
        <DrawerRow icon="heroicons:puzzle-piece" icon-color="rgb(249 115 22)" label="Konektor" @click="navigateToRoute('/konektor')" />
        <DrawerRow icon="heroicons:document-text" icon-color="rgb(14 165 233)" label="Dokumen" @click="navigateToRoute('/documents')" />
        <DrawerRow v-if="isExpert" icon="heroicons:computer-desktop" icon-color="rgb(244 63 94)" label="Monitoring" @click="navigateToRoute('/monitoring')" />
      </DrawerSection>

      <!-- Section: Akun & Bantuan -->
      <DrawerSection title="Akun & Bantuan">
        <DrawerRow icon="heroicons:bell" :icon-color="`var(--wp-text-secondary)`" label="Notifikasi" show-badge :badge-count="unreadCount" @click="navigateToRoute('/notifikasi')" />
        <DrawerRow icon="heroicons:question-mark-circle" :icon-color="`var(--wp-text-secondary)`" label="Bantuan" @click="navigateToRoute('/help')" />
        <DrawerRow icon="heroicons:user-circle" :icon-color="`var(--wp-text-secondary)`" label="Profil Saya" @click="navigateToRoute('/profile')" />
      </DrawerSection>

      <!-- Upgrade + Logout footer -->
      <template #footer>
        <div class="space-y-2">
          <button class="w-full py-3 text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); border-radius: var(--wp-radius-mobile);">
            <Icon name="heroicons:plus" class="w-4 h-4" />
            <span>Tingkatkan Paket</span>
          </button>
          <button @click="onLogout" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold text-rose-600 active:bg-rose-50 dark:active:bg-rose-950/40 transition" style="background: rgba(220, 38, 38, 0.06); border-radius: var(--wp-radius-mobile); min-height: var(--wp-touch-target);">
            <Icon name="heroicons:arrow-left-on-rectangle" class="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </template>
    </MobileSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useNotificationStore } from '~/composables/useNotificationStore'
import MobileSheet from './mobile/MobileSheet.vue'
import DrawerSection from './mobile/DrawerSection.vue'
import DrawerRow from './mobile/DrawerRow.vue'

const route = useRoute()
const { user } = useAuth()
const { unreadCount } = useNotificationStore()

const isDrawerOpen = ref(false)

// Cap drawer height so it never feels like a full-page takeover on tall phones.
const maxDrawerHeight = '85vh'

defineProps<{
  showCrm?: boolean
  isExpert?: boolean
}>()

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const navigateToRoute = (path: string) => {
  isDrawerOpen.value = false
  navigateTo(path)
}

const onLogout = () => {
  isDrawerOpen.value = false
  emit('logout')
}

// Auto close drawer on route change
watch(() => route.path, () => {
  isDrawerOpen.value = false
})
</script>

<style scoped>
.mobile-nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: var(--wp-bottom-nav-height);
  color: var(--wp-text-secondary);
  transition: all 0.15s ease;
  text-decoration: none;
  background: transparent;
  border: none;
}

.mobile-nav-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.mobile-nav-link.mobile-nav-active {
  color: var(--wp-gold);
}

.mobile-nav-link.mobile-nav-active svg,
.mobile-nav-link.mobile-nav-active .icon {
  color: var(--wp-gold);
  transform: scale(1.1);
}
</style>
