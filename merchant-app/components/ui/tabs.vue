<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: string
}>()

import { defineOptions } from 'vue'
defineOptions({ name: 'UiTabs' })


</script>

<template>
  <div :class="cn('', props.class)">
    <slot :select="selectTab" :active="props.modelValue" />
  </div>
</template>
