<template>
  <header
    class="mobile-page-header sticky top-0 z-[var(--wp-z-sticky)] md:hidden bg-[var(--wp-bg)] border-b border-[var(--wp-border)]"
    :style="{ paddingTop: 'var(--wp-safe-area-top)' }"
  >
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <!-- Left: back button / brand -->
      <div class="flex items-center gap-2 min-w-0">
        <button
          v-if="back"
          @click="onBack"
          class="p-2 -ml-2 rounded-lg active:bg-slate-100 dark:active:bg-slate-800 transition"
          style="color: var(--wp-text);"
          aria-label="Kembali"
        >
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>
        <div class="min-w-0">
          <p v-if="title" class="text-sm font-black truncate" style="color: var(--wp-text);">{{ title }}</p>
          <p v-if="subtitle" class="text-[10px] font-bold uppercase tracking-wider truncate" style="color: var(--wp-text-secondary);">{{ subtitle }}</p>
        </div>
      </div>

      <!-- Right: actions -->
      <div v-if="$slots.actions" class="flex items-center gap-1 shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <!-- Optional period / filter bar -->
    <div v-if="$slots.filters" class="px-4 pb-3">
      <slot name="filters" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from '#app'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    /** Show a back button that navigates to `back` route (or router.back()). */
    back?: string | boolean
  }>(),
  {
    back: false,
  }
)

const router = useRouter()

function onBack() {
  if (typeof props.back === 'string') {
    router.push(props.back)
  } else {
    router.back()
  }
}
</script>
