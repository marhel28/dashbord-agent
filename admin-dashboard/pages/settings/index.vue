<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Pengaturan Admin</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi preferensi sistem, tema tampilan, parameter kecerdasan buatan, dan kontrol keamanan platform.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        class="rounded-lg text-xs font-medium h-9 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 gap-1.5"
        @click="resetToDefault"
      >
        <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
        <span>Reset ke Pengaturan Awal</span>
      </Button>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0',
          activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
      >
        <Icon :name="tab.icon" class="w-4 h-4" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- TAB 1: TAMPILAN & TEMA -->
    <div v-if="activeTab === 'appearance'" class="space-y-6">
      <!-- Section: Tampilan Antarmuka (Tema) -->
      <div class="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Tema Antarmuka Admin</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sesuaikan palet visual dengan kondisi pencahayaan dan kenyamanan kerja Anda.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
          <button
            v-for="mode in themeOptions"
            :key="mode.value"
            @click="colorMode.preference = mode.value"
            :class="['p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all',
              colorMode.preference === mode.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold shadow-xs' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60']"
          >
            <Icon :name="mode.icon" class="w-4 h-4" />
            <span>{{ mode.label }}</span>
          </button>
        </div>
      </div>

      <!-- Section: Preferensi Data & Tampilan Tabel -->
      <div class="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
        <div>
          <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Preferensi Tabel & Kueri</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengaturan default paging AG Grid dan penyegaran data otomatis.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jumlah Baris per Halaman</label>
            <select v-model="settings.pageSize" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none">
              <option :value="10">10 Baris</option>
              <option :value="20">20 Baris (Disarankan)</option>
              <option :value="50">50 Baris</option>
              <option :value="100">100 Baris</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Interval Sinkronisasi Live (Detik)</label>
            <select v-model="settings.syncInterval" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none">
              <option :value="0">Nonaktifkan (Manual)</option>
              <option :value="30">Setiap 30 Detik</option>
              <option :value="60">Setiap 1 Menit</option>
              <option :value="300">Setiap 5 Menit</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: AI & COPILOT SETTINGS -->
    <div v-else-if="activeTab === 'ai'" class="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-5">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Konfigurasi Agentic AI & Model</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Atur parameter model inferensi, batas kuota per merchant, dan preferensi tool calling.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Default AI Engine</label>
          <select v-model="settings.aiEngine" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none">
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Kecepatan Maksimal)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Penalaran Kompleks)</option>
            <option value="qwen-2.5-coder">Qwen 2.5 Local Fallback</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Maksimal Token Respons</label>
          <input v-model.number="settings.maxTokens" type="number" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none font-mono" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">System Prompt Prefix (Global Policy)</label>
          <textarea v-model="settings.systemPrompt" rows="3" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none resize-none font-mono"></textarea>
        </div>
      </div>

      <div class="pt-2 flex justify-end">
        <Button size="sm" @click="saveSettings" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs">
          Simpan Konfigurasi AI
        </Button>
      </div>
    </div>

    <!-- TAB 3: KEAMANAN & SISTEM -->
    <div v-else-if="activeTab === 'security'" class="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-5">
      <div>
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Kebijakan Verifikasi & Keamanan</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Atur aturan verifikasi otomatis untuk pendaftaran merchant baru.
        </p>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Verifikasi Otomatis Merchant Baru</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pedagang baru yang mendaftar via Telegram langsung aktif tanpa antrean manual.</p>
          </div>
          <input type="checkbox" v-model="settings.autoVerify" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
        </div>

        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Logging Audit Lengkap</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Catat setiap mutasi inventaris dan perubahan lokasi pedagang ke log sistem.</p>
          </div>
          <input type="checkbox" v-model="settings.auditLogging" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
        </div>
      </div>
    </div>

    <!-- App System Info Footer -->
    <div class="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">N</div>
        <div>
          <h3 class="font-bold text-slate-900 dark:text-slate-100">Nahkoda Admin Copilot</h3>
          <p class="text-[11px] text-slate-400">Pusat Kendali Ekosistem UMKM & AI Automation</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Badge variant="outline" class="font-mono text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          v2.4.0-Enterprise
        </Badge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const colorMode = useColorMode()
const activeTab = ref('appearance')

const tabs = [
  { id: 'appearance', label: 'Tampilan & Tema', icon: 'lucide:palette' },
  { id: 'ai', label: 'Parameter AI', icon: 'lucide:sparkles' },
  { id: 'security', label: 'Keamanan & Verifikasi', icon: 'lucide:shield-check' },
]

const themeOptions = [
  { label: 'Terang', value: 'light', icon: 'lucide:sun' },
  { label: 'Gelap', value: 'dark', icon: 'lucide:moon' },
  { label: 'Sistem', value: 'system', icon: 'lucide:laptop' },
]

const settings = reactive({
  pageSize: 20,
  syncInterval: 60,
  aiEngine: 'gemini-2.0-flash',
  maxTokens: 2048,
  systemPrompt: 'Anda adalah asisten cerdas Nahkoda Copilot yang melayani pedagang UMKM Indonesia dengan ramah, akurat, dan solutif.',
  autoVerify: false,
  auditLogging: true
})

const resetToDefault = () => {
  colorMode.preference = 'light'
  settings.pageSize = 20
  settings.syncInterval = 60
  settings.aiEngine = 'gemini-2.0-flash'
  settings.maxTokens = 2048
  settings.autoVerify = false
  settings.auditLogging = true
}

const saveSettings = () => {
  alert('Pengaturan berhasil disimpan!')
}
</script>
