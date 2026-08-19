<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiTableHeader' })


</script>

<template>
  <thead :class="cn('[&_tr]:border-b', props.class)">
    <slot />
  </thead>
</template>
