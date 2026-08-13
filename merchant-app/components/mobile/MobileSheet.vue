<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[var(--wp-z-modal)] bg-slate-900/60"
        style="overscroll-behavior: none;"
        @click="onBackdropClick"
        aria-hidden="true"
      />
    </Transition>

    <!-- Sheet -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 z-[calc(var(--wp-z-modal)+1)] flex flex-col bg-[var(--wp-surface)] shadow-2xl md:hidden mobile-surface"
        :style="{
          maxHeight: maxHeight,
          borderTopLeftRadius: 'var(--wp-radius-mobile)',
          borderTopRightRadius: 'var(--wp-radius-mobile)',
          paddingBottom: 'max(0.75rem, var(--wp-safe-area-bottom))',
        }"
        role="dialog"
        aria-modal="true"
      >
        <!-- Drag handle + header -->
        <div class="px-4 pt-3 pb-2 shrink-0">
          <div
            class="w-12 h-1 rounded-full mx-auto mb-3"
            style="background: var(--wp-border);"
            @pointerdown="onHandlePointerDown"
          />
          <div v-if="title || $slots.handle" class="flex items-center justify-between">
            <slot name="handle">
              <h3 class="text-sm font-black" style="color: var(--wp-text);">{{ title }}</h3>
            </slot>
            <button
              v-if="dismissable"
              @click="close"
              class="p-1.5 rounded-lg border"
              style="border-color: var(--wp-border); color: var(--wp-text-secondary);"
              aria-label="Tutup"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto momentum-scroll px-4 pb-4" style="overscroll-behavior: contain;">
          <slot />
        </div>

        <!-- Sticky footer -->
        <div
          v-if="$slots.footer"
          class="shrink-0 px-4 pt-3 border-t"
          :style="{
            borderColor: 'var(--wp-border)',
            paddingBottom: 'max(0.75rem, var(--wp-safe-area-bottom))',
          }"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    maxHeight?: string
    dismissable?: boolean
    /** Close when content is dragged downward past this threshold (px). */
    dragDismissThreshold?: number
  }>(),
  {
    maxHeight: '85vh',
    dismissable: true,
    dragDismissThreshold: 120,
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:open', false)
  emit('close')
}

function onBackdropClick() {
  if (props.dismissable) close()
}

// -- Drag-to-dismiss on the handle --
let dragStartY = 0
let dragging = false

function onHandlePointerDown(e: PointerEvent) {
  if (!props.dismissable) return
  dragging = true
  dragStartY = e.clientY
  const onMove = (ev: PointerEvent) => {
    if (!dragging) return
    const dy = ev.clientY - dragStartY
    if (dy > props.dragDismissThreshold) {
      close()
      cleanup()
    }
  }
  const onUp = () => cleanup()
  function cleanup() {
    dragging = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

// Lock body scroll while open
watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
    document.body.style.overscrollBehavior = isOpen ? 'none' : ''
  },
  { immediate: true }
)

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.body.style.overscrollBehavior = ''
})
</script>
