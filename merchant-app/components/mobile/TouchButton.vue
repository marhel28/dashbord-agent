<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    class="touch-btn inline-flex items-center justify-center gap-2 font-bold transition select-none shrink-0 rounded-lg"
    :class="[
      paddingClass,
      block ? 'w-full' : '',
    ]"
    :style="{
      minHeight: 'var(--wp-touch-target)',
      minWidth: 'var(--wp-touch-target)',
      ...variantStyle,
    }"
  >
    <Icon v-if="icon" :name="icon" class="w-4 h-4 shrink-0" />
    <span v-if="$slots.default" class="truncate"><slot /></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    icon?: string
    to?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
  }
)

const paddingClass = computed(() => {
  // All sizes guarantee 44px min-height via inline style; this tunes padding/font.
  if (props.size === 'sm') return 'px-3 py-1.5 text-xs'
  if (props.size === 'lg') return 'px-6 py-3 text-sm'
  return 'px-4 py-2 text-xs' // md (default)
})

/**
 * Variants are expressed as inline styles so they always win over the global
 * `.rounded-2xl { border-radius: 6px !important }` override (inline styles
 * beat the !important rule). The component stays dark-mode safe by using
 * `var(--wp-*)` tokens.
 */
const variantStyle = computed<Record<string, string>>(() => {
  switch (props.variant) {
    case 'secondary':
      return {
        background: 'var(--wp-navy)',
        color: '#FFFFFF',
        borderRadius: 'var(--wp-radius-mobile)',
      }
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--wp-text)',
        border: '1px solid var(--wp-border)',
        borderRadius: 'var(--wp-radius-mobile)',
      }
    case 'danger':
      return {
        background: 'var(--wp-error)',
        color: '#FFFFFF',
        borderRadius: 'var(--wp-radius-mobile)',
      }
    default:
      // primary — gold gradient
      return {
        background: 'linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark))',
        color: '#FFFFFF',
        borderRadius: 'var(--wp-radius-mobile)',
      }
  }
})
</script>
