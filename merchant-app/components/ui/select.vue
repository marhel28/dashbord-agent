<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiSelect' })

const modelValue = defineModel<string | number>()

const props = defineProps<{
  placeholder?: string
  class?: string
}>()
</script>

<template>
  <select
    v-model="modelValue"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <slot />
  </select>
</template>
