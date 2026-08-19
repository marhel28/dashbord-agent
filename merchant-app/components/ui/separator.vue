<script setup lang="ts">
import { cn } from '~/utils/cn'
import { defineOptions } from 'vue'
defineOptions({ name: 'UiSeparator' })

const props = defineProps<{
  class?: string
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}>()

const orientation = props.orientation ?? 'horizontal'
const decorative = props.decorative ?? true
</script>

<template>
  <div
    :role="decorative ? 'none' : 'separator'"
    :aria-orientation="orientation"
    :class="
      cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        props.class,
      )
    "
  />
</template>
