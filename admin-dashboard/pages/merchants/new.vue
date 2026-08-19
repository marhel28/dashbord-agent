<template>
  <div class="space-y-8 animate-fade-in max-w-4xl mx-auto py-2 pb-10">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink to="/merchants" class="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors bg-white dark:bg-slate-900 shadow-2xs">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Tambah Pedagang Baru
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Daftarkan merchant baru secara manual sebagai admin platform.</p>
      </div>
    </div>

    <!-- Success result (one-time temp password) -->
    <div v-if="created" class="bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
          <Icon name="lucide:check-circle" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Merchant Berhasil Didaftarkan</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Bagikan kredensial dan kata sandi sementara ke pemilik toko.</p>
        </div>
      </div>

      <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-4">
        <p class="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Icon name="lucide:alert-triangle" class="w-4 h-4 text-amber-600" />
          <span>Pemberitahuan Kunci Keamanan</span>
        </p>
        <p class="text-xs text-amber-700 dark:text-amber-400">Simpan kata sandi di bawah ini. Kata sandi <strong>tidak akan ditampilkan lagi</strong> setelah Anda meninggalkan halaman ini.</p>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <span class="text-xs text-slate-500 dark:text-slate-400">Email Akun</span>
          <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ created.email }}</span>
        </div>
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <span class="text-xs text-slate-500 dark:text-slate-400">Kata Sandi Sementara</span>
          <div class="flex items-center gap-2">
            <code class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">{{ created.temp_password }}</code>
            <Button size="sm" variant="outline" @click="copyPassword" class="text-xs h-8 px-3 rounded-lg gap-1">
              <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Tersalin!' : 'Salin' }}</span>
            </Button>
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <NuxtLink :to="`/merchants/${created.uuid}`">
          <Button class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg gap-2 shadow-xs">
            <span>Buka Profil Pedagang</span>
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </Button>
        </NuxtLink>
        <NuxtLink to="/merchants">
          <Button variant="outline" class="text-xs rounded-lg">
            Kembali ke Daftar
          </Button>
        </NuxtLink>
      </div>
    </div>

    <!-- Create form -->
    <form v-else @submit.prevent="createMerchant" class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Pemilik <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all" placeholder="cth: Budi Santoso" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Toko <span class="text-red-500">*</span></label>
          <input v-model="form.store_name" type="text" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all" placeholder="cth: Toko Berkah Jaya" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email <span class="text-red-500">*</span></label>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all" placeholder="cth: budi@gmail.com" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nomor Telepon <span class="text-red-500">*</span></label>
          <input v-model="form.phone_number" type="tel" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all font-mono" placeholder="cth: 081234567890" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kategori Usaha</label>
          <select v-model="form.category_store" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none">
            <option v-for="cat in STORE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Alamat Fisik Lengkap <span class="text-red-500">*</span></label>
          <textarea v-model="form.address" rows="2" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" placeholder="Alamat lengkap toko / warung..."></textarea>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi Singkat</label>
          <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" placeholder="Deskripsi mengenai produk & spesialisasi (opsional)"></textarea>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
        <Button type="submit" :disabled="saving" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg px-5 shadow-xs flex items-center gap-2">
          <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ saving ? 'Mendaftarkan...' : 'Daftarkan Pedagang' }}</span>
        </Button>
        <NuxtLink to="/merchants">
          <Button variant="outline" class="text-xs rounded-lg">
            Batal
          </Button>
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'

const router = useRouter()

const STORE_CATEGORIES = [
  'Makanan & Minuman',
  'Toko Retail',
  'Fashion',
  'Kecantikan & Perawatan',
  'Kesehatan',
  'Elektronik & Gadget',
  'Rumah Tangga & Furniture',
  'Pertanian',
  'Peternakan',
  'Perikanan',
  'Otomotif',
  'Konstruksi & Bangunan',
  'Percetakan & Advertising',
  'Jasa Profesional',
  'Jasa Digital',
  'Pendidikan',
  'Pariwisata',
  'Transportasi & Logistik',
  'Kerajinan',
  'Industri & Produksi',
  'Hewan Peliharaan',
  'Laundry & Kebersihan',
  'Marketplace & Online Shop',
  'Lainnya',
]

const form = ref({
  name: '',
  store_name: '',
  email: '',
  phone_number: '',
  category_store: 'Makanan & Minuman',
  address: '',
  description: '',
})

const saving = ref(false)
const created = ref<any>(null)
const copied = ref(false)

const createMerchant = async () => {
  saving.value = true
  try {
    const res = await api.post('/admin/merchants', form.value)
    if (res) {
      created.value = res
    }
  } catch (err: any) {
    console.error("Failed to create merchant", err)
    alert(err?.message || 'Gagal membuat merchant.')
  } finally {
    saving.value = false
  }
}

const copyPassword = async () => {
  if (!created.value?.temp_password) return
  try {
    await navigator.clipboard.writeText(created.value.temp_password)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (_) {
    alert('Gagal menyalin. Silakan salin manual.')
  }
}
</script>
