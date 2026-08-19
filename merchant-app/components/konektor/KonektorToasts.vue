<!--
  KonektorToasts — toast notification renderer for the Connector Hub.

  Renders the toasts array from useConnectors with auto-dismiss.
  Positioned fixed at bottom-right.
-->
<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm max-w-xs"
        :class="toastClasses(t.type)"
      >
        <Icon :name="toastIcon(t.type)" class="w-4 h-4 shrink-0" />
        <p class="text-xs font-medium leading-tight">{{ t.message }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useConnectors'
import { useConnectors } from '~/composables/useConnectors'

const { toasts } = useConnectors()

const toastClasses = (type: Toast['type']) => {
  if (type === 'success') return 'bg-success-bg border-success-border text-success'
  if (type === 'error') return 'bg-destructive-bg border-destructive-border text-destructive'
  return 'bg-info-bg border-info-border text-info'
}

const toastIcon = (type: Toast['type']) => {
  if (type === 'success') return 'lucide:check-circle-2'
  if (type === 'error') return 'lucide:alert-circle'
  return 'lucide:info'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
