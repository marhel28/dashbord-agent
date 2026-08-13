<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-900/60"
      @click="$emit('close')"
    ></div>
  </Transition>

  <!-- Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed z-50 flex flex-col"
      :class="isMobile ? 'bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl' : 'top-0 right-0 bottom-0 w-[380px] border-l border-[var(--wp-border)]'"
      style="background: white;"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--wp-border)] shrink-0">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:shopping-cart" class="w-5 h-5" style="color: var(--wp-navy);" />
          <h3 class="text-sm font-black" style="color: var(--wp-text);">Keranjang</h3>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background: var(--wp-navy); color: white;">
            {{ totalItems }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="items.length > 0"
            @click="clear"
            class="text-[10px] font-bold uppercase tracking-wider"
            style="color: var(--wp-text-secondary);"
          >
            Kosongkan
          </button>
          <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded transition">
            <Icon name="heroicons:x-mark" class="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-16 px-4">
          <Icon name="heroicons:shopping-cart" class="w-12 h-12 text-slate-200" />
          <p class="text-sm font-bold mt-3" style="color: var(--wp-text-secondary);">Keranjang kosong</p>
          <p class="text-xs text-slate-400 mt-1">Tambah produk untuk mulai belanja</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="item in items"
            :key="item.product.uuid"
            class="flex gap-3 px-4 py-3"
          >
            <!-- Thumbnail -->
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <img
                v-if="item.product.photo_url"
                :src="item.product.photo_url"
                :alt="item.product.product_name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="heroicons:photo" class="w-5 h-5 text-slate-300" />
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold truncate" style="color: var(--wp-text);">
                {{ item.product.product_name }}
              </p>
              <p class="text-xs mt-0.5" style="color: var(--wp-gold); font-family: var(--wp-font-mono, monospace);">
                Rp {{ formatPrice(item.product.price * item.quantity) }}
              </p>
            </div>

            <!-- Quantity Stepper -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                @click="setQuantity(item.product.uuid, item.quantity - 1)"
                class="w-6 h-6 rounded flex items-center justify-center border border-[var(--wp-border)] hover:bg-slate-50 transition"
              >
                <Icon name="heroicons:minus" class="w-3 h-3 text-slate-500" />
              </button>
              <span class="text-xs font-bold w-5 text-center" style="color: var(--wp-text);">
                {{ item.quantity }}
              </span>
              <button
                @click="setQuantity(item.product.uuid, item.quantity + 1)"
                :disabled="item.quantity >= item.product.stock_quantity"
                class="w-6 h-6 rounded flex items-center justify-center border border-[var(--wp-border)] hover:bg-slate-50 transition disabled:opacity-40"
              >
                <Icon name="heroicons:plus" class="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="items.length > 0" class="border-t border-[var(--wp-border)] px-4 py-3 space-y-3 shrink-0">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium" style="color: var(--wp-text-secondary);">Subtotal</span>
          <span class="text-sm font-black" style="color: var(--wp-text); font-family: var(--wp-font-mono, monospace);">
            Rp {{ formatPrice(subtotal) }}
          </span>
        </div>
        <button
          @click="$emit('checkout')"
          class="w-full py-3 rounded-lg text-sm font-black text-white transition hover:opacity-90"
          style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));"
        >
          BELI SEKARANG
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCart, type CartItem } from '~/composables/useCart'
import { useViewport } from '~/composables/useViewport'

const props = defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
  checkout: []
}>()

const cart = useCart()
const items = computed(() => cart.items.value)
const totalItems = computed(() => cart.totalItems.value)
const subtotal = computed(() => cart.subtotal.value)

// Migrated from the old `window.innerWidth < 1024` one-shot to the reactive
// useViewport composable, and aligned to the app's locked `md:` (768px) breakpoint.
const { isMobile } = useViewport()

const setQuantity = (uuid: string, qty: number) => {
  cart.setQuantity(uuid, qty)
}

const clear = () => {
  cart.clear()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
