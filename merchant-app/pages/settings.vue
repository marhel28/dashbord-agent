<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Pengaturan</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi preferensi aplikasi, mode operasional toko, dan antarmuka akun Anda.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        class="rounded-lg text-xs font-medium h-9 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
        @click="resetToDefault"
      >
        <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
        <span>Kembalikan ke Default</span>
      </Button>
    </div>

    <!-- ═══════════ 2. NAVIGATION TABS ═══════════ -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
          activeTab === tab.id ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
      >
        <Icon :name="tab.icon" class="w-4 h-4" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- ═══════════ TAB 1: TAMPILAN & MODE ═══════════ -->
    <div v-if="activeTab === 'appearance'" class="space-y-6">
      <!-- ── Section: Mode Operasional Toko ── -->
      <div class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Mode Operasional Toko</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih tingkat kelengkapan fitur yang sesuai dengan kebutuhan operasional warung/toko Anda.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Basic Mode Radio Card -->
          <div
            @click="setMode('basic')"
            :class="['p-5 rounded-xl border cursor-pointer transition-all space-y-2 relative',
              storeMode === 'basic' ? 'border-[#047857] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300']"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-slate-100">Basic Mode</span>
              <span v-if="storeMode === 'basic'" class="w-4 h-4 rounded-full bg-[#047857] text-white flex items-center justify-center text-[10px]">✓</span>
              <span v-else class="w-4 h-4 rounded-full border border-slate-300"></span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tampilan sederhana. Menyembunyikan menu analisis mendalam. Cocok untuk penggunaan kasir harian yang ramah dan bebas kebingungan.
            </p>
          </div>

          <!-- Expert Mode Radio Card -->
          <div
            @click="setMode('expert')"
            :class="['p-5 rounded-xl border cursor-pointer transition-all space-y-2 relative',
              storeMode === 'expert' ? 'border-[#047857] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300']"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-slate-100">Expert Mode</span>
              <span v-if="storeMode === 'expert'" class="w-4 h-4 rounded-full bg-[#047857] text-white flex items-center justify-center text-[10px]">✓</span>
              <span v-else class="w-4 h-4 rounded-full border border-slate-300"></span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Akses penuh ke seluruh fitur termasuk AI Copilot, Otomatisasi Scheduler, Knowledge Base, dan analitik bisnis mendalam.
            </p>
          </div>
        </div>
      </div>

      <!-- ── Section: Tampilan Antarmuka (Tema) ── -->
      <div class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Tampilan Antarmuka (Tema)</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sesuaikan tema visual dengan kenyamanan mata Anda saat berjualan.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-3 max-w-md">
          <button
            v-for="mode in themeOptions"
            :key="mode.value"
            @click="colorMode.preference = mode.value"
            :class="['p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all',
              colorMode.preference === mode.value ? 'border-[#047857] bg-emerald-50 text-[#047857] dark:bg-emerald-950 dark:text-emerald-300 font-bold shadow-xs' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900']"
          >
            <Icon :name="mode.icon" class="w-4 h-4" />
            <span>{{ mode.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ TAB 2: PROFIL AKUN TOKO ═══════════ -->
    <div v-else-if="activeTab === 'profile'" class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Profil & Identitas Toko</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi dasar warung/toko yang terhubung dengan AI Copilot.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Toko / Merchant</label>
          <input type="text" value="Toko Sembako Berkah" disabled class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pemilik / Penanggung Jawab</label>
          <input type="text" value="Ibu Hajah Siti" disabled class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium" />
        </div>
      </div>
    </div>

    <!-- ═══════════ 3. INFORMATION ARCHITECTURE: ABOUT APP FOOTER ═══════════ -->
    <div class="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#047857] text-white flex items-center justify-center font-bold text-sm">N</div>
        <div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100">Nahkoda Business Copilot</h3>
          <p class="text-[11px] text-slate-400">Agentic AI System untuk Membantu Operasional Warung & UMKM</p>
        </div>
      </div>

      <span class="font-mono text-[11px] bg-slate-200/60 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 self-start sm:self-auto">
        v2.4.0-Enterprise
      </span>
    </div>

    <!-- Toast Feedback Notification -->
    <Teleport to="body">
      <div v-if="toastMessage" class="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in-up">
        <Icon name="lucide:check-circle-2" class="w-4 h-4 text-emerald-400" />
        <span>{{ toastMessage }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '~/components/ui/button.vue'

const colorMode = useColorMode()
const storeMode = ref<'basic' | 'expert'>('basic')
const activeTab = ref('appearance')
const toastMessage = ref('')

const tabs = [
  { id: 'appearance', label: 'Tampilan & Mode', icon: 'lucide:layout-grid' },
  { id: 'profile', label: 'Profil Toko', icon: 'lucide:store' },
]

const themeOptions = [
  { value: 'light', label: 'Terang', icon: 'lucide:sun' },
  { value: 'dark', label: 'Gelap', icon: 'lucide:moon' },
  { value: 'system', label: 'Sistem', icon: 'lucide:laptop' },
]

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

const setMode = (mode: 'basic' | 'expert') => {
  storeMode.value = mode
  if (process.client) {
    localStorage.setItem('store_mode', mode)
  }
  showToast(mode === 'expert' ? 'Anda sekarang dalam mode Expert. Seluruh fitur AI diaktifkan.' : 'Kembali ke mode Basic sederhana.')
}

const resetToDefault = () => {
  setMode('basic')
  colorMode.preference = 'system'
  showToast('Pengaturan telah dikembalikan ke default sistem.')
}

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('store_mode')
    if (saved === 'basic' || saved === 'expert') {
      storeMode.value = saved
    }
  }
})
</script>
