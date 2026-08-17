<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiDropdownMenuSeparator' })


</script>

<template>
  <div :class="cn('-mx-1 my-1 h-px bg-muted', props.class)" />
</template>
