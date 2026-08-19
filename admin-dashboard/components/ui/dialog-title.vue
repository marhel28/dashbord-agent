<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiDialogTitle' })


</script>

<template>
  <h2 :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)">
    <slot />
  </h2>
</template>
