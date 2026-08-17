<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiTextarea' })

const modelValue = defineModel<string>()

const props = defineProps<{
  placeholder?: string
  rows?: number | string
  class?: string
}>()
</script>

<template>
  <textarea
    v-model="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :class="
      cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
