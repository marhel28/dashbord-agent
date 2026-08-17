<script setup lang="ts">
import { defineOptions } from 'vue'
defineOptions({ name: 'UiDialog' })


</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        @click="open = false"
      />
    </Transition>
    <Transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-4"
      leave-to-class="opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
