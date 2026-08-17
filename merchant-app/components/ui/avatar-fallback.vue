<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiAvatarFallback' })


</script>

<template>
  <div
    :class="
      cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
