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

      <!-- Tabs -->
      <div class="sticky top-14 z-[calc(var(--wp-z-sticky)-1)] bg-white border-b border-[var(--wp-border)]">
        <div class="max-w-5xl mx-auto flex">
          <button
            @click="activeTab = 'shop'"
            class="flex-1 py-3 text-xs font-bold transition relative"
            :style="activeTab === 'shop' ? 'color: var(--wp-gold);' : 'color: var(--wp-text-secondary);'"
          >
            <Icon name="heroicons:shopping-bag" class="w-4 h-4 inline mr-1" />
            Belanja
            <div v-if="activeTab === 'shop'" class="absolute bottom-0 left-4 right-4 h-0.5 rounded" style="background: var(--wp-gold);"></div>
          </button>
          <button
            @click="activeTab = 'pending'"
            class="flex-1 py-3 text-xs font-bold transition relative"
            :style="activeTab === 'pending' ? 'color: var(--wp-gold);' : 'color: var(--wp-text-secondary);'"
          >
            <Icon name="heroicons:clock" class="w-4 h-4 inline mr-1" />
            Pesanan Pending
            <span v-if="pendingSales.length > 0" class="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style="background: var(--wp-navy); color: white;">
              {{ pendingSales.length }}
            </span>
            <div v-if="activeTab === 'pending'" class="absolute bottom-0 left-4 right-4 h-0.5 rounded" style="background: var(--wp-gold);"></div>
          </button>
        </div>
      </div>

      <!-- Tab: Belanja (Shopping) -->
      <div v-show="activeTab === 'shop'">
        <ProductGrid
          :products="products"
          :loading="loading"
          :merchant-uuid="merchantUuid"
          @add="onAddToCart"
        />
      </div>

      <!-- Tab: Pesanan Pending -->
      <div v-show="activeTab === 'pending'" class="px-4 sm:px-6 py-4 max-w-5xl mx-auto">
        <div v-if="pendingLoading" class="flex items-center justify-center py-12">
          <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin" style="color: var(--wp-gold);" />
        </div>

        <div v-else-if="pendingSales.length === 0" class="text-center py-16">
          <Icon name="heroicons:document-text" class="w-12 h-12 mx-auto text-slate-200" />
          <p class="text-sm font-bold mt-3" style="color: var(--wp-text-secondary);">Tidak ada pesanan pending</p>
          <p class="text-xs mt-1 text-slate-400">Pesanan yang belum dibayar akan muncul di sini.</p>
          <p class="text-[10px] mt-1 text-slate-400">Pesanan pending akan otomatis dihapus setelah 5 menit.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="sale in pendingSales"
            :key="sale.uuid"
            class="bg-white border border-[var(--wp-border)] rounded-xl p-4 shadow-sm"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-bold" style="color: var(--wp-text);">{{ sale.invoice_number }}</p>
                <p v-if="sale.customer_name" class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">
                  {{ sale.customer_name }}
                </p>
                <p class="text-[10px] mt-0.5" style="color: var(--wp-text-secondary);">
                  {{ sale.item_count }} item · {{ sale.payment_method || 'Belum pilih metode' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-black" style="color: var(--wp-gold); font-family: var(--wp-font-mono, monospace);">
                  Rp {{ formatPrice(sale.total) }}
                </p>
                <!-- Countdown timer -->
                <p
                  class="text-[10px] font-bold mt-1 flex items-center justify-end gap-1"
                  :style="sale.seconds_remaining <= 60 ? 'color: #EF4444;' : 'color: var(--wp-text-secondary);'"
                >
                  <Icon name="heroicons:clock" class="w-3 h-3" />
                  {{ formatCountdown(sale.seconds_remaining) }}
                </p>
              </div>
            </div>

            <div class="flex gap-2.5 mt-3">
              <button
                @click="continueSale(sale)"
                class="flex-1 py-2.5 min-h-[44px] rounded-lg text-xs font-bold text-white transition hover:opacity-90 flex items-center justify-center"
                style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));"
              >
                Lanjutkan
              </button>
              <button
                @click="cancelSale(sale.uuid)"
                class="px-4 py-2.5 min-h-[44px] rounded-lg text-xs font-bold border border-[var(--wp-border)] transition hover:bg-slate-50 flex items-center justify-center"
                style="color: var(--wp-text-secondary);"
              >
                Hapus
              </button>
            </div>
          </div>

          <p class="text-[10px] text-center text-slate-400 pt-2">
            Pesanan pending otomatis dihapus setelah 5 menit
          </p>
        </div>
      </div>

      <!-- Cart Trigger (Mobile: fixed bottom bar) — only on shop tab -->
      <div
        v-if="totalItems > 0 && activeTab === 'shop'"
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

      <!-- Cart Trigger (Desktop: floating button) — only on shop tab -->
      <button
        v-if="totalItems > 0 && activeTab === 'shop'"
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
        :existing-sale="continuingSale"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#imports'
import { useCart } from '~/composables/useCart'
import { publicApi, type PublicMerchantProfile, type PublicProduct } from '~/composables/usePublicApi'
import { api } from '~/utils/api'
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
const activeTab = ref<'shop' | 'pending'>('shop')
const continuingSale = ref<any>(null)

// Pending sales state
const pendingSales = ref<any[]>([])
const pendingLoading = ref(false)
let pendingRefreshInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

const totalItems = computed(() => cart.totalItems.value)
const subtotal = computed(() => cart.subtotal.value)
const cartItems = computed(() => cart.items.value)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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
  continuingSale.value = null
  checkoutOpen.value = true
}

const onCheckoutSuccess = () => {
  checkoutOpen.value = false
  continuingSale.value = null
  cart.clear()
  // Refresh pending sales after successful payment
  fetchPendingSales()
}

// Fetch pending sales from backend
const fetchPendingSales = async () => {
  pendingLoading.value = true
  try {
    const result = await api.get('/transaksi/sales/pending')
    pendingSales.value = result || []
  } catch {
    pendingSales.value = []
  } finally {
    pendingLoading.value = false
  }
}

// Continue a pending sale — load its items into cart and open checkout
const continueSale = async (sale: any) => {
  try {
    // Fetch full sale details (includes items with product info)
    const detail = await api.get(`/transaksi/sales/${sale.uuid}`)

    // Fetch product details for each item to get names
    const itemsWithNames = []
    for (const item of detail.items || []) {
      try {
        const product = await api.get(`/stocks/${item.stock_uuid}`)
        itemsWithNames.push({
          ...item,
          product_name: product?.product_name || 'Produk',
          photo_url: product?.photo_url || null,
        })
      } catch {
        itemsWithNames.push({
          ...item,
          product_name: 'Produk',
          photo_url: null,
        })
      }
    }

    // Clear current cart and load sale items
    cart.clear()
    for (const item of itemsWithNames) {
      cart.addItem({
        uuid: item.stock_uuid,
        product_name: item.product_name,
        price: item.price,
        photo_url: item.photo_url,
        unit: 'pcs',
        category: null,
        stock_quantity: 999, // Allow continuing even if stock changed
      })
      // Set the correct quantity
      const cartItem = cart.items.value.find(i => i.product.uuid === item.stock_uuid)
      if (cartItem) {
        cartItem.quantity = item.quantity
      }
    }

    continuingSale.value = detail
    activeTab.value = 'shop'
    checkoutOpen.value = true
  } catch (err: any) {
    alert(err.message || 'Gagal melanjutkan pesanan')
  }
}

// Cancel/delete a pending sale
const cancelSale = async (saleUuid: string) => {
  if (!confirm('Hapus pesanan pending ini?')) return
  try {
    await api.delete(`/transaksi/sales/${saleUuid}`)
    pendingSales.value = pendingSales.value.filter(s => s.uuid !== saleUuid)
  } catch (err: any) {
    // If delete endpoint doesn't exist, just remove from list
    pendingSales.value = pendingSales.value.filter(s => s.uuid !== saleUuid)
  }
}

// Tick countdown every second
const tickCountdown = () => {
  for (const sale of pendingSales.value) {
    if (sale.seconds_remaining > 0) {
      sale.seconds_remaining--
    }
  }
  // Remove expired (0 seconds) from display — backend will delete on next fetch
  pendingSales.value = pendingSales.value.filter(s => s.seconds_remaining > 0)
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

  // Fetch pending sales and start auto-refresh
  await fetchPendingSales()
  pendingRefreshInterval = setInterval(fetchPendingSales, 30000) // Refresh every 30s
  countdownInterval = setInterval(tickCountdown, 1000) // Tick every second
})

onUnmounted(() => {
  if (pendingRefreshInterval) clearInterval(pendingRefreshInterval)
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>
