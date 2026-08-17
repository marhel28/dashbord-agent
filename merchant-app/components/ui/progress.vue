<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiProgress' })

const props = withDefaults(defineProps<{
  value?: number
  max?: number
  class?: string
}>(), {
  value: 0,
  max: 100,
})
</script>

<template>
  <div
    :class="cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary/20', props.class)"
  >
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ width: `${(props.value / props.max) * 100}%` }"
    />
  </div>
</template>
