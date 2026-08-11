<template>
  <div class="drawer-section mb-4">
    <p class="drawer-section-title">
      {{ title }}
    </p>
    <div class="space-y-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.drawer-section-title {
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--wp-text-secondary);
}
</style>
