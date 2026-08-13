<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
      <!-- State: Form -->
      <div v-if="state === 'form'" class="p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-black" style="color: var(--wp-navy);">Checkout</h3>
          <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded transition">
            <Icon name="heroicons:x-mark" class="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <!-- Order Summary -->
        <div class="bg-slate-50 rounded-lg p-3 mb-4">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ringkasan Pesanan</p>
          <div v-for="item in items" :key="item.product.uuid" class="flex justify-between text-xs py-1">
            <span style="color: var(--wp-text);">{{ item.product.product_name }} x{{ item.quantity }}</span>
            <span class="font-bold" style="color: var(--wp-text);">Rp {{ formatPrice(item.product.price * item.quantity) }}</span>
          </div>
          <div class="border-t border-slate-200 mt-2 pt-2 flex justify-between">
            <span class="text-xs font-bold" style="color: var(--wp-text);">Total</span>
            <span class="text-sm font-black" style="color: var(--wp-gold);">Rp {{ formatPrice(subtotal) }}</span>
          </div>
        </div>

        <!-- Customer Name -->
        <div class="mb-4">
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Nama Pelanggan (opsional)</label>
          <input
            v-model="customerName"
            type="text"
            placeholder="Nama pelanggan..."
            class="w-full px-3 py-2 rounded-lg border border-[var(--wp-border)] text-sm focus:outline-none focus:border-[var(--wp-gold)]"
          />
        </div>

        <!-- Payment Method -->
        <div class="mb-5">
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Metode Pembayaran</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="method in paymentMethods"
              :key="method.value"
              @click="paymentMethod = method.value"
              class="py-3 rounded-lg border text-center transition"
              :style="paymentMethod === method.value
                ? 'border-color: var(--wp-gold); background: rgba(212,168,67,0.08);'
                : 'border-color: var(--wp-border);'"
            >
              <Icon :name="method.icon" class="w-5 h-5 mx-auto" :style="`color: ${paymentMethod === method.value ? 'var(--wp-gold)' : 'var(--wp-text-secondary)'};`" />
              <span class="text-[10px] font-bold block mt-1" :style="`color: ${paymentMethod === method.value ? 'var(--wp-gold)' : 'var(--wp-text-secondary)'};`">
                {{ method.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          @click="createOrder"
          :disabled="!paymentMethod || creating"
          class="w-full py-3 rounded-lg text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50"
          style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));"
        >
          <span v-if="creating" class="flex items-center justify-center gap-2">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            Memproses...
          </span>
          <span v-else>BUAT PESANAN</span>
        </button>
      </div>

      <!-- State: Awaiting Payment -->
      <div v-else-if="state === 'awaiting_payment'" class="p-5 text-center">
        <div v-if="paymentMethod === 'QRIS'" class="space-y-4">
          <Icon name="heroicons:qr-code" class="w-10 h-10 mx-auto" style="color: var(--wp-navy);" />
          <h3 class="text-base font-black" style="color: var(--wp-navy);">Scan QRIS untuk Bayar</h3>
          <p class="text-xs" style="color: var(--wp-text-secondary);">
            Scan kode QR di bawah dengan aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, dll)
          </p>

          <!-- QR Code Image -->
          <div v-if="qrisData?.qr_code_url" class="bg-white border-2 border-[var(--wp-border)] rounded-xl p-4 inline-block">
            <img :src="qrisData.qr_code_url" alt="QRIS" class="w-48 h-48 mx-auto" />
          </div>
          <div v-else class="bg-slate-100 rounded-xl p-8 inline-block">
            <Icon name="heroicons:qr-code" class="w-24 h-24 text-slate-300" />
          </div>

          <div class="bg-slate-50 rounded-lg p-3 text-left">
            <div class="flex justify-between text-xs">
              <span style="color: var(--wp-text-secondary);">Invoice</span>
              <span class="font-bold" style="color: var(--wp-text);">{{ saleData?.invoice_number }}</span>
            </div>
            <div class="flex justify-between text-xs mt-1">
              <span style="color: var(--wp-text-secondary);">Total</span>
              <span class="font-black" style="color: var(--wp-gold);">Rp {{ formatPrice(saleData?.total || 0) }}</span>
            </div>
          </div>

          <p class="text-[10px] text-slate-400 animate-pulse">Menunggu pembayaran...</p>

          <button
            @click="checkQrisStatus"
            class="text-xs font-bold underline"
            style="color: var(--wp-navy);"
          >
            Cek Status Pembayaran
          </button>
        </div>

        <div v-else class="space-y-4">
          <Icon name="heroicons:check-circle" class="w-10 h-10 mx-auto text-green-500" />
          <h3 class="text-base font-black" style="color: var(--wp-navy);">Pesanan Dibuat</h3>

          <div class="bg-slate-50 rounded-lg p-3 text-left space-y-2">
            <div class="flex justify-between text-xs">
              <span style="color: var(--wp-text-secondary);">Invoice</span>
              <span class="font-bold" style="color: var(--wp-text);">{{ saleData?.invoice_number }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color: var(--wp-text-secondary);">Total</span>
              <span class="font-black" style="color: var(--wp-gold);">Rp {{ formatPrice(saleData?.total || 0) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color: var(--wp-text-secondary);">Metode</span>
              <span class="font-bold" style="color: var(--wp-text);">{{ paymentMethod === 'CASH' ? 'Tunai' : 'Transfer' }}</span>
            </div>
          </div>

          <p class="text-xs" style="color: var(--wp-text-secondary);">
            {{ paymentMethod === 'CASH' ? 'Terima tunai dari pelanggan, lalu konfirmasi pembayaran.' : 'Instruksikan pelanggan untuk transfer, lalu konfirmasi.' }}
          </p>

          <button
            @click="confirmPayment"
            class="w-full py-3 rounded-lg text-sm font-black text-white transition hover:opacity-90"
            style="background: linear-gradient(135deg, #10B981, #059669);"
          >
            KONFIRMASI SUDAH BAYAR
          </button>
        </div>

        <button @click="$emit('close')" class="mt-3 text-xs font-medium" style="color: var(--wp-text-secondary);">
          Tutup
        </button>
      </div>

      <!-- State: Paid -->
      <div v-else-if="state === 'paid'" class="p-8 text-center">
        <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style="background: rgba(16, 185, 129, 0.1);">
          <Icon name="heroicons:check" class="w-8 h-8 text-green-500" />
        </div>
        <h3 class="text-lg font-black" style="color: var(--wp-navy);">Pembayaran Berhasil!</h3>
        <p class="text-sm mt-1" style="color: var(--wp-text-secondary);">
          Transaksi selesai. Terima kasih!
        </p>
        <p v-if="saleData?.invoice_number" class="text-xs mt-2 font-mono" style="color: var(--wp-text-secondary);">
          {{ saleData.invoice_number }}
        </p>
        <button
          @click="$emit('close')"
          class="mt-5 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition"
          style="background: var(--wp-navy);"
        >
          Tutup & Kembali
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '~/utils/api'
import { useCart, type CartItem } from '~/composables/useCart'

const props = defineProps<{
  items: CartItem[]
  subtotal: number
  existingSale?: any | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const cart = useCart()

const state = ref<'form' | 'awaiting_payment' | 'paid'>('form')
const customerName = ref('')
const paymentMethod = ref<string>('')
const creating = ref(false)
const saleData = ref<any>(null)
const qrisData = ref<any>(null)

// If continuing an existing sale, pre-fill and skip creation
onMounted(() => {
  if (props.existingSale) {
    saleData.value = props.existingSale
    customerName.value = props.existingSale.customer_name || ''
    paymentMethod.value = props.existingSale.payment_method || ''
    if (paymentMethod.value) {
      state.value = 'awaiting_payment'
    }
  }
})

const paymentMethods = [
  { value: 'CASH', label: 'Tunai', icon: 'heroicons:banknotes' },
  { value: 'TRANSFER', label: 'Transfer', icon: 'heroicons:building-library' },
  { value: 'QRIS', label: 'QRIS', icon: 'heroicons:qr-code' },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const createOrder = async () => {
  if (!paymentMethod.value) return

  // If continuing an existing sale, just update payment method and proceed
  if (props.existingSale) {
    saleData.value = props.existingSale
    if (paymentMethod.value === 'QRIS') {
      try {
        const qris = await api.post(`/payment/midtrans/create/${saleData.value.uuid}`)
        qrisData.value = qris
      } catch (qrisErr) {
        console.warn('QRIS creation failed:', qrisErr)
        qrisData.value = null
      }
    }
    state.value = 'awaiting_payment'
    return
  }

  creating.value = true
  try {
    // Create the sale
    const salePayload = {
      customer_name: customerName.value || null,
      payment_method: paymentMethod.value,
      discount: 0,
      items: props.items.map(item => ({
        stock_uuid: item.product.uuid,
        quantity: item.quantity,
      })),
    }

    const sale = await api.post('/transaksi/sales', salePayload)
    saleData.value = sale

    if (paymentMethod.value === 'QRIS') {
      // Create Midtrans QRIS transaction
      try {
        const qris = await api.post(`/payment/midtrans/create/${sale.uuid}`)
        qrisData.value = qris
      } catch (qrisErr) {
        console.warn('QRIS creation failed, showing fallback:', qrisErr)
        qrisData.value = null
      }
    }

    state.value = 'awaiting_payment'
  } catch (err: any) {
    alert(err.message || 'Gagal membuat pesanan')
  } finally {
    creating.value = false
  }
}

const confirmPayment = async () => {
  if (!saleData.value) return
  try {
    await api.post(`/transaksi/sales/${saleData.value.uuid}/pay`)
    state.value = 'paid'
    cart.clear()
    emit('success')
  } catch (err: any) {
    alert(err.message || 'Gagal mengkonfirmasi pembayaran')
  }
}

const checkQrisStatus = async () => {
  if (!saleData.value) return
  try {
    const status = await api.get(`/payment/midtrans/status/${saleData.value.uuid}`)
    if (status.status === 'paid') {
      state.value = 'paid'
      cart.clear()
      emit('success')
    } else {
      alert(`Status: ${status.status}. Pembayaran belum diterima.`)
    }
  } catch (err: any) {
    alert(err.message || 'Gagal mengecek status')
  }
}
</script>
