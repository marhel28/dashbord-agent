<script setup lang="ts">
import { defineOptions } from 'vue'
defineOptions({ name: 'UiDropdownMenu' })


</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50" @click="open = false">
      <div class="absolute inset-0" />
    </div>
    <div v-if="open" class="absolute z-50" @click.stop>
      <slot />
    </div>
  </Teleport>
</template>
