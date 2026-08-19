<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink to="/ai" class="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-white dark:bg-slate-900 shadow-2xs">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Performa Inferensi AI
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis kecepatan token output, konsumsi biaya API, dan distribusi error model.
          </p>
        </div>
      </div>
    </div>

    <!-- Telemetry Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs space-y-2">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Kecepatan Output (TPS)</h3>
        <p class="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">84.2 <span class="text-xs font-sans text-slate-400 font-normal">tokens/sec</span></p>
        <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Icon name="lucide:trending-up" class="w-3.5 h-3.5" />
          <span>Optimal pada Gemini 2.0</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs space-y-2">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimasi Biaya Inferensi</h3>
        <p class="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">$4.12 <span class="text-xs font-sans text-slate-400 font-normal">/ 100k prompts</span></p>
        <p class="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Icon name="lucide:check" class="w-3.5 h-3.5" />
          <span>Sangat Hemat (Flash tier)</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs space-y-2">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tingkat Kegagalan (Error Rate)</h3>
        <p class="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">0.06%</p>
        <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Icon name="lucide:shield-check" class="w-3.5 h-3.5" />
          <span>Sangat Stabil</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
