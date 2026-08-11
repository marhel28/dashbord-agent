<template>
  <button
    type="button"
    class="drawer-row w-full flex items-center gap-3 px-3 active:bg-slate-100 dark:active:bg-slate-800 transition"
    :style="{ minHeight: 'var(--wp-touch-target)' }"
    @click="onClick"
  >
    <Icon :name="icon" class="w-4 h-4 shrink-0" :style="{ color: iconColor }" />
    <span class="flex-1 text-left text-xs font-semibold truncate" style="color: var(--wp-text);">{{ label }}</span>
    <span v-if="showBadge && badgeCount > 0" class="px-2 py-0.5 text-[9px] font-bold rounded-full text-white shrink-0" style="background: var(--wp-navy);">
      {{ badgeCount }}
    </span>
    <Icon name="heroicons:chevron-right" class="w-4 h-4 shrink-0" style="color: var(--wp-text-secondary);" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  iconColor?: string
  label: string
  showBadge?: boolean
  badgeCount?: number
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped>
.drawer-row {
  border-radius: var(--wp-radius-mobile);
}
</style>
