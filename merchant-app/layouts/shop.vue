<template>
  <div class="min-h-screen flex flex-col" style="background: var(--wp-bg); font-family: var(--wp-font, 'Fira Sans', sans-serif);">
    <!-- Slim storefront top bar -->
    <header class="h-14 bg-white border-b border-[var(--wp-border)] px-4 flex items-center justify-between shrink-0 sticky top-0 z-[var(--wp-z-sticky)]">
      <div class="flex items-center gap-2">
        <img src="/logo_lightmode.png" class="w-8 h-8 object-contain" alt="Nahkoeda" />
        <span class="font-black text-sm tracking-tight" style="color: var(--wp-navy);">Toko</span>
      </div>
      <NuxtLink
        v-if="isAuthed"
        to="/"
        class="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
        style="color: var(--wp-text-secondary);"
      >
        <Icon name="heroicons:arrow-left" class="w-3.5 h-3.5" />
        Dashboard
      </NuxtLink>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const isAuthed = computed(() => process.client && !!localStorage.getItem('access_token'))
</script>
