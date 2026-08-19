<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiScrollArea' })


</script>

<template>
  <div :class="cn('relative overflow-hidden', props.class)">
    <div class="h-full w-full overflow-auto">
      <slot />
    </div>
  </div>
</template>
