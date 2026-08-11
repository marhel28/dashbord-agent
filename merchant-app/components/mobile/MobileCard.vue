<template>
  <div
    class="mobile-card w-full bg-[var(--wp-surface)] border border-[var(--wp-border)] mobile-surface overflow-hidden"
    :class="{ 'cursor-pointer active:scale-[0.98] transition': clickable }"
    @click="onClick"
  >
    <!-- Top: thumbnail / title / price / badge -->
    <div v-if="$slots.top || $slots.badge" class="flex items-start gap-3 p-4 pb-0">
      <div class="flex-1 min-w-0">
        <slot name="top" />
      </div>
      <div v-if="$slots.badge" class="shrink-0">
        <slot name="badge" />
      </div>
    </div>

    <!-- Title-only shorthand when no top slot -->
    <div v-if="title && !$slots.top" class="px-4 pt-4">
      <p class="text-sm font-bold truncate" style="color: var(--wp-text);">{{ title }}</p>
      <p v-if="subtitle" class="text-xs mt-0.5 truncate" style="color: var(--wp-text-secondary);">{{ subtitle }}</p>
    </div>

    <!-- Metrics grid (label/value pairs) -->
    <div v-if="$slots.metrics" class="px-4 pt-3">
      <slot name="metrics" />
    </div>

    <!-- Generic body -->
    <div v-if="$slots.default" class="p-4">
      <slot />
    </div>

    <!-- Footer: action buttons -->
    <div
      v-if="$slots.footer"
      class="flex items-center gap-2 px-4 py-3 border-t"
      style="border-color: var(--wp-border);"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  clickable?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>

<style scoped>
.mobile-card {
  border-radius: var(--wp-radius-mobile);
  min-height: var(--wp-touch-target);
}
</style>
