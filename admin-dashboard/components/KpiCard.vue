<template>
  <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden group">
    <div class="absolute top-0 left-0 right-0 h-0.5" :style="{ background: accent }"></div>
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ title }}</span>
      <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50">
        <Icon :name="icon" class="w-4 h-4" :style="{ color: iconColor || accent }" />
      </div>
    </div>
    <p class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
      {{ value }}
    </p>
    <p v-if="change !== undefined" class="text-xs font-semibold mt-2 flex items-center gap-1"
       :class="change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
      <Icon :name="change >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="w-3.5 h-3.5" />
      <span>{{ change >= 0 ? '+' : '' }}{{ change }}%</span>
      <span class="font-normal text-slate-400 ml-0.5">{{ changeLabel || 'vs bulan lalu' }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  accent: string
  iconColor?: string
  change?: number
  changeLabel?: string
}>()
</script>
