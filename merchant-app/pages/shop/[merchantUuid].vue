<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin" style="color: var(--wp-gold);" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 px-4">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 mx-auto text-amber-400" />
      <p class="text-sm font-bold mt-3" style="color: var(--wp-text);">{{ error }}</p>
      <NuxtLink to="/" class="text-xs font-bold mt-3 inline-block" style="color: var(--wp-gold);">
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- Shop -->
    <div v-else>
      <StoreHeader :merchant="merchant" />
      <ProductGrid
        :products="products"
        :loading="loading"
        :merchant-uuid="merchantUuid"
        @add="onAddToCart"
      />

      <!-- Cart Trigger (Mobile: fixed bottom bar) -->
      <div
        v-if="totalItems > 0"
        class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--wp-border)] px-4 py-3 flex items-center justify-between z-[var(--wp-z-sticky)]"
      >
        <div>
          <span class="text-xs font-bold" style="color: var(--wp-text);">{{ totalItems }} item</span>
          <span class="text-xs font-black ml-2" style="color: var(--wp-gold); font-family: var(--wp-font-mono, monospace);">
            Rp {{ formatPrice(subtotal) }}
          </span>
        </div>
        <button
          @click="cartOpen = true"
          class="px-4 py-2 rounded-lg text-xs font-bold text-white"
          style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));"
        >
          <Icon name="heroicons:shopping-cart" class="w-4 h-4 inline mr-1" />
          Lihat Keranjang
        </button>
      </div>

      <!-- Cart Trigger (Desktop: floating button) -->
      <button
        v-if="totalItems > 0"
        @click="cartOpen = true"
        class="hidden lg:flex fixed bottom-6 left-6 z-[var(--wp-z-fab)] items-center gap-2 px-4 py-3 rounded-full text-white shadow-lg transition hover:scale-105"
        style="background: var(--wp-navy); box-shadow: 0 4px 16px rgba(15, 26, 46, 0.3);"
      >
        <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
        <span class="text-xs font-bold">{{ totalItems }} item</span>
        <span class="text-xs font-black" style="font-family: var(--wp-font-mono, monospace);">
          Rp {{ formatPrice(subtotal) }}
        </span>
      </button>

      <!-- Cart Panel -->
      <CartPanel
        :is-open="cartOpen"
        @close="cartOpen = false"
        @checkout="openCheckout"
      />

      <!-- Checkout Modal -->
      <CheckoutModal
        v-if="checkoutOpen"
        :items="cartItems"
        :subtotal="subtotal"
        @close="checkoutOpen = false"
        @success="onCheckoutSuccess"
      />

      <!-- WhatsApp Chat Button -->
      <ChatButton
        v-if="merchant"
        :phone-number="merchant.phone_number"
        :store-name="merchant.store_name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useCart } from '~/composables/useCart'
import { publicApi, type PublicMerchantProfile, type PublicProduct } from '~/composables/usePublicApi'
import StoreHeader from '~/components/shop/StoreHeader.vue'
import ProductGrid from '~/components/shop/ProductGrid.vue'
import CartPanel from '~/components/shop/CartPanel.vue'
import CheckoutModal from '~/components/shop/CheckoutModal.vue'
import ChatButton from '~/components/shop/ChatButton.vue'

definePageMeta({ layout: 'shop' })

const route = useRoute()
const cart = useCart()

const merchantUuid = route.params.merchantUuid as string
const merchant = ref<PublicMerchantProfile | null>(null)
const products = ref<PublicProduct[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const cartOpen = ref(false)
const checkoutOpen = ref(false)

const totalItems = computed(() => cart.totalItems.value)
const subtotal = computed(() => cart.subtotal.value)
const cartItems = computed(() => cart.items.value)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const onAddToCart = (product: PublicProduct) => {
  cart.addItem({
    uuid: product.uuid,
    product_name: product.product_name,
    price: product.price,
    photo_url: product.photo_url,
    unit: product.unit,
    category: product.category,
    stock_quantity: product.stock_quantity,
  })
}

const openCheckout = () => {
  cartOpen.value = false
  checkoutOpen.value = true
}

const onCheckoutSuccess = () => {
  checkoutOpen.value = false
  cart.clear()
}

onMounted(async () => {
  try {
    const data = await publicApi.getProducts(merchantUuid)
    merchant.value = data.merchant
    products.value = data.products
  } catch (err: any) {
    error.value = err.message || 'Gagal memuat toko'
  } finally {
    loading.value = false
  }
})
</script>
