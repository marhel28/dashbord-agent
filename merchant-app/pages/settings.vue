<template>
  <div class="space-y-6">
    <div class="border-b pb-4" style="border-color: var(--wp-navy);">
      <h1 class="text-2xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Pengaturan</h1>
      <p class="text-xs font-semibold mt-1" style="color: var(--wp-text-secondary);">
        Konfigurasi preferensi aplikasi, pengaturan antarmuka, dan default akun.
      </p>
    </div>

    <!-- Interface Preferences Card -->
    <div class="bg-white border p-6 shadow-sm" style="border-color: var(--wp-border); border-radius: 0px;">
      <h2 class="text-sm font-bold uppercase tracking-wider mb-4" style="color: var(--wp-navy);">Tampilan Antarmuka</h2>
      
      <div class="space-y-6">
        <!-- Theme Selector -->
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

        <hr style="border-color: var(--wp-border);" />

        <!-- App Information -->
        <div>
          <p class="text-xs font-bold" style="color: var(--wp-text);">Informasi Aplikasi</p>
          <div class="mt-3 space-y-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
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
const colorMode = useColorMode()
</script>
