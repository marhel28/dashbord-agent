<template>
  <div class="space-y-6 pb-safe">
    <!-- Desktop header (>= 768px) -->
    <div class="hidden md:block border-b pb-4" style="border-color: var(--wp-navy);">
      <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Pengaturan</h1>
      <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
        Konfigurasi preferensi aplikasi, pengaturan antarmuka, dan default akun.
      </p>
    </div>

    <!-- Mobile title (< 768px) -->
    <h1 class="md:hidden text-xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Pengaturan</h1>

    <!-- ── Mode Toko ── -->
    <div>
      <!-- Desktop card wrapper -->
      <div class="hidden md:block bg-white border p-6 shadow-sm" style="border-color: var(--wp-border); border-radius: 0px;">
        <h2 class="text-sm font-bold uppercase tracking-wider mb-4" style="color: var(--wp-navy);">Mode Toko</h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold" style="color: var(--wp-text);">Mode Tampilan</p>
            <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">Pilih mode Basic untuk tampilan sederhana, atau Expert untuk akses semua fitur.</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="setMode('basic')"
              class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all"
              :style="storeMode === 'basic'
                ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: 0px;'
                : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: 0px;'"
            >Basic</button>
            <button
              @click="setMode('expert')"
              class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all"
              :style="storeMode === 'expert'
                ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: 0px;'
                : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: 0px;'"
            >Expert</button>
          </div>
        </div>
        <div class="mt-4 p-3 rounded border" style="background: var(--wp-bg); border-color: var(--wp-border);">
          <p class="text-[10px] font-semibold" style="color: var(--wp-text-secondary);">
            <template v-if="storeMode === 'basic'">
              <span class="font-bold" style="color: var(--wp-navy);">Mode Basic:</span> Menyembunyikan menu Tim, Operasional, dan Monitoring. Cocok untuk penggunaan sehari-hari.
            </template>
            <template v-else>
              <span class="font-bold" style="color: var(--wp-navy);">Mode Expert:</span> Menampilkan semua menu termasuk Tim, Operasional, dan Monitoring. Akses penuh ke semua fitur.
            </template>
          </p>
        </div>
      </div>

      <!-- Mobile: native settings-list row -->
      <div class="md:hidden bg-[var(--wp-surface)] border border-[var(--wp-border)] mobile-surface divide-y" style="border-color: var(--wp-border);">
        <div class="px-4 py-3 flex items-center justify-between" style="min-height: var(--wp-touch-target);">
          <div>
            <p class="text-xs font-bold" style="color: var(--wp-text);">Mode Tampilan</p>
            <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">Basic atau Expert</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              @click="setMode('basic')"
              class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all"
              :style="storeMode === 'basic'
                ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: var(--wp-radius-mobile);'
                : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: var(--wp-radius-mobile);'"
            >Basic</button>
            <button
              @click="setMode('expert')"
              class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all"
              :style="storeMode === 'expert'
                ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: var(--wp-radius-mobile);'
                : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: var(--wp-radius-mobile);'"
            >Expert</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tampilan Antarmuka ── -->
    <div>
      <!-- Desktop card wrapper -->
      <div class="hidden md:block bg-white border p-6 shadow-sm" style="border-color: var(--wp-border); border-radius: 0px;">
        <h2 class="text-sm font-bold uppercase tracking-wider mb-4" style="color: var(--wp-navy);">Tampilan Antarmuka</h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold" style="color: var(--wp-text);">Mode Tema</p>
            <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">Pilih tema terang atau gelap untuk kenyamanan mata Anda.</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-for="mode in ['light', 'dark', 'system']"
              :key="mode"
              @click="colorMode.preference = mode"
              class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all"
              :style="colorMode.preference === mode
                ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: 0px;'
                : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: 0px;'"
            >
              {{ mode === 'light' ? 'Terang' : mode === 'dark' ? 'Gelap' : 'Sistem' }}
            </button>
          </div>
        </div>
        <hr class="my-5" style="border-color: var(--wp-border);" />
        <div>
          <p class="text-xs font-bold" style="color: var(--wp-text);">Informasi Aplikasi</p>
          <div class="mt-3 space-y-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <p>Nama Aplikasi: Nahkoeda</p>
            <p>Tagline: Agentic AI Bot untuk Membantu Warung</p>
            <p>Versi: v2.4.0-Enterprise</p>
          </div>
        </div>
      </div>

      <!-- Mobile: native settings-list -->
      <div class="md:hidden bg-[var(--wp-surface)] border border-[var(--wp-border)] mobile-surface divide-y" style="border-color: var(--wp-border);">
        <div class="px-4 py-3" style="min-height: var(--wp-touch-target);">
          <p class="text-xs font-bold mb-2" style="color: var(--wp-text);">Mode Tema</p>
          <div class="flex items-center gap-1.5">
            <button
              v-for="mode in ['light', 'dark', 'system']"
              :key="mode"
              @click="colorMode.preference = mode"
              class="flex-1 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider border transition-all"
              :style="colorMode.preference === mode
                ? 'background: var(--wp-navy); border-color: var(--wp-navy); color: white; border-radius: var(--wp-radius-mobile);'
                : 'background: #FFFFFF; border-color: var(--wp-border); color: var(--wp-text-secondary); border-radius: var(--wp-radius-mobile);'"
            >
              {{ mode === 'light' ? 'Terang' : mode === 'dark' ? 'Gelap' : 'Sistem' }}
            </button>
          </div>
        </div>
        <div class="px-4 py-3">
          <p class="text-xs font-bold mb-1" style="color: var(--wp-text);">Informasi Aplikasi</p>
          <div class="space-y-1 text-[10px] font-semibold uppercase tracking-wider" style="color: var(--wp-text-secondary);">
            <p>Nama Aplikasi: Nahkoeda</p>
            <p>Tagline: Agentic AI Bot untuk Membantu Warung</p>
            <p>Versi: v2.4.0-Enterprise</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const colorMode = useColorMode()
const storeMode = ref<'basic' | 'expert'>('basic')

const setMode = (mode: 'basic' | 'expert') => {
  storeMode.value = mode
  if (process.client) {
    localStorage.setItem('store_mode', mode)
  }
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
