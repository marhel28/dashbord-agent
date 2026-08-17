<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiAvatarImage' })


</script>

<template>
  <img
    :src="props.src"
    :alt="props.alt || ''"
    :class="cn('aspect-square h-full w-full object-cover', props.class)"
  />
</template>
