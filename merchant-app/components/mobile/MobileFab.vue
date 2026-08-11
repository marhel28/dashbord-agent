<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    class="mobile-fab fixed z-[calc(var(--wp-z-sticky)-1)] flex items-center justify-center w-14 h-14 text-white shadow-lg active:scale-95 transition-transform bottom-20 md:bottom-6 right-6"
    :style="{
      background: 'linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark))',
      boxShadow: '0 4px 16px rgba(212, 168, 67, 0.4)',
      borderRadius: 'var(--wp-radius-mobile)',
    }"
    :aria-label="label"
    @click="onClick"
  >
    <Icon :name="icon" class="w-6 h-6" />
  </component>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  to?: string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function onClick(e: MouseEvent) {
  emit('click', e)
}
</script>
