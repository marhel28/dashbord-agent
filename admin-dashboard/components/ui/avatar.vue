<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiAvatar' })


</script>

<template>
  <div
    :class="
      cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
