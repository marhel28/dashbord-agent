<template>
  <div class="hscroll-table relative md:hidden">
    <!-- Right-edge fade hint + scroll cue -->
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-8 z-10"
      style="background: linear-gradient(to right, transparent, var(--wp-bg));"
      aria-hidden="true"
    />
    <div
      class="overflow-x-auto momentum-scroll pb-2"
      :class="snap ? 'snap-x snap-mandatory' : ''"
    >
      <div :class="innerClass" :style="{ minWidth: minWidth }">
        <slot />
      </div>
    </div>
    <!-- Scroll hint -->
    <p v-if="hint" class="text-[10px] font-bold uppercase tracking-wider mt-1" style="color: var(--wp-text-secondary);">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Minimum width of the inner content (e.g. '640px'). Defaults to max-content. */
    minWidth?: string
    /** Apply scroll-snap on columns. */
    snap?: boolean
    /** Class applied to the inner flex/table wrapper. */
    innerClass?: string
    /** Hint text shown below the scroll area (e.g. 'Geser untuk melihat lebih'). */
    hint?: string
  }>(),
  {
    minWidth: 'max-content',
    snap: false,
    innerClass: '',
    hint: 'Geser untuk melihat lebih →',
  }
)
</script>

<style scoped>
.hscroll-table {
  /* ensure the fade doesn't get the 6px radius override */
  border-radius: 0;
}
</style>
