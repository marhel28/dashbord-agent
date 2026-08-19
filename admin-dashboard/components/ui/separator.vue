<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiSeparator' })


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
