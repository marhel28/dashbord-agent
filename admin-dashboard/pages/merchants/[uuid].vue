<template>
  <div class="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-10" v-if="!loading && merchant">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/merchants" class="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors bg-white dark:bg-slate-900 shadow-2xs">
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {{ merchant.store_name || merchant.name }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Detail Profil & Analitik Pedagang</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="destructive" size="sm" @click="showDeleteConfirm = true" class="rounded-lg text-xs gap-1.5 shadow-xs">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
          <span>Nonaktifkan</span>
        </Button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Icon name="lucide:alert-triangle" class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Nonaktifkan Pedagang?</h3>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Apakah Anda yakin ingin menonaktifkan <strong class="text-slate-900 dark:text-slate-100">{{ merchant.store_name || merchant.name }}</strong>?
          Merchant tidak akan bisa login lagi, tetapi seluruh riwayat transaksi & inventaris tetap tersimpan.
        </p>
        <div class="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" @click="showDeleteConfirm = false" class="rounded-lg text-xs">
            Batal
          </Button>
          <Button variant="destructive" size="sm" @click="deleteMerchant" :disabled="deleting" class="rounded-lg text-xs gap-1.5 shadow-xs">
            <Icon v-if="deleting" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ deleting ? 'Menonaktifkan...' : 'Ya, Nonaktifkan' }}</span>
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Profile Card -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs text-center relative">
          <Button v-if="!editing" variant="outline" size="sm" @click="startEdit" class="absolute top-4 right-4 text-xs h-8 px-3 rounded-lg gap-1.5">
            <Icon name="lucide:edit-2" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Edit</span>
          </Button>

          <!-- View mode -->
          <div v-if="!editing" class="space-y-4">
            <div class="w-24 h-24 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-900 shadow-md overflow-hidden flex items-center justify-center">
              <img v-if="merchant.photo_profile" :src="merchant.photo_profile" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold uppercase text-3xl">
                {{ merchant.name.charAt(0) }}
              </div>
            </div>

            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ merchant.store_name || merchant.name }}</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ merchant.name }}</p>
            </div>

            <div class="flex flex-wrap justify-center gap-1.5">
              <Badge variant="secondary" class="font-medium text-xs">
                {{ merchant.category_store || 'Tanpa Kategori' }}
              </Badge>
              <Badge v-if="merchant.store_type" variant="outline" class="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                {{ merchant.store_type }}
              </Badge>
            </div>

            <div class="space-y-3 text-left border-t border-slate-100 dark:border-slate-700/60 pt-4 text-xs">
              <div class="flex items-center gap-3">
                <Icon name="lucide:mail" class="w-4 h-4 text-slate-400 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300 truncate">{{ merchant.email }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Icon name="lucide:phone" class="w-4 h-4 text-slate-400 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300 font-mono">{{ merchant.phone_number || '-' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Icon name="lucide:calendar" class="w-4 h-4 text-slate-400 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">Bergabung {{ new Date(merchant.created_at).toLocaleDateString('id-ID') }}</span>
              </div>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-else class="text-left space-y-3">
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 text-center mb-3">Edit Data Pedagang</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pemilik</label>
                <input v-model="editForm.name" type="text" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Toko</label>
                <input v-model="editForm.store_name" type="text" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Telepon</label>
                <input v-model="editForm.phone_number" type="tel" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none font-mono" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Usaha</label>
                <select v-model="editForm.category_store" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none">
                  <option v-for="cat in STORE_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Toko / Jenis Usaha</label>
                <select v-model="editForm.store_type" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none">
                  <option v-for="st in STORE_TYPES" :key="st" :value="st">{{ st }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                <textarea v-model="editForm.address" rows="2" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                <textarea v-model="editForm.description" rows="2" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none"></textarea>
              </div>
            </div>

            <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <Button size="sm" @click="saveEdit" :disabled="saving" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg">
                <Icon v-if="saving" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ saving ? 'Menyimpan...' : 'Simpan' }}</span>
              </Button>
              <Button variant="outline" size="sm" @click="cancelEdit" class="text-xs rounded-lg">
                Batal
              </Button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 shadow-xs" v-if="merchant.description">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tentang Toko</h3>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{{ merchant.description }}</p>
        </div>
      </div>

      <!-- Right Column: Wallet + Location & Stats -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Wallet Card -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Icon name="lucide:wallet" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dompet & Keuangan Merchant</span>
            </h3>
            <Button variant="ghost" size="sm" @click="fetchWallet" class="text-xs h-8 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 gap-1">
              <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" :class="{'animate-spin': walletLoading}" />
              <span>Refresh</span>
            </Button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-4 text-center">
              <p class="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Saldo Tersedia</p>
              <p class="text-lg font-bold text-emerald-900 dark:text-emerald-300 font-mono">Rp {{ formatRupiah(wallet.balance || 0) }}</p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl p-4 text-center">
              <p class="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mb-1">Total Pendapatan</p>
              <p class="text-lg font-bold text-blue-900 dark:text-blue-300 font-mono">Rp {{ formatRupiah(wallet.total_earned || 0) }}</p>
            </div>
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-4 text-center">
              <p class="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mb-1">Total Ditarik</p>
              <p class="text-lg font-bold text-amber-900 dark:text-amber-300 font-mono">Rp {{ formatRupiah(wallet.total_withdrawn || 0) }}</p>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div v-if="wallet.transactions && wallet.transactions.length > 0" class="pt-2">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Transaksi Terakhir</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="(txn, i) in wallet.transactions" :key="i" class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0" :class="txn.type === 'CREDIT' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'">
                    <Icon :name="txn.type === 'CREDIT' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'" class="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-slate-900 dark:text-slate-100">{{ txn.description || txn.type }}</p>
                    <p class="text-[10px] text-slate-400 font-mono">{{ new Date(txn.created_at).toLocaleDateString('id-ID') }}</p>
                  </div>
                </div>
                <span class="text-xs font-bold font-mono" :class="txn.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                  {{ txn.type === 'CREDIT' ? '+' : '-' }}Rp {{ formatRupiah(txn.amount) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-xs text-slate-400">
            Belum ada transaksi pada dompet ini.
          </div>
        </div>

        <!-- Address & Map -->
        <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-6 shadow-xs flex flex-col h-[450px]">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">Lokasi Toko Fisik</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ merchant.address || 'Alamat fisik belum disetel' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Button v-if="merchant.latitude && merchant.longitude" variant="destructive" size="sm" @click="deleteLocation" :disabled="deletingLocation" class="text-xs h-8 gap-1">
                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                <span>Hapus Titik</span>
              </Button>
              <Button variant="outline" size="sm" @click="showLocationEdit = true" class="text-xs h-8 gap-1">
                <Icon name="lucide:map-pin" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Edit Koordinat</span>
              </Button>
            </div>
          </div>

          <div class="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
             <div v-if="merchant.latitude && merchant.longitude" ref="mapContainer" class="w-full h-full"></div>
             <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2">
               <Icon name="lucide:map-pin-off" class="w-8 h-8 opacity-50" />
               <p class="text-xs">Titik GPS lokasi belum disematkan</p>
               <Button variant="outline" size="sm" @click="showLocationEdit = true" class="text-xs rounded-lg">
                 + Tambahkan Titik GPS
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Edit Modal -->
    <MerchantLocationEdit
      v-if="showLocationEdit"
      :merchant="merchant"
      @close="showLocationEdit = false"
      @saved="onLocationSaved"
    />
  </div>

  <div v-else-if="loading" class="flex justify-center items-center h-[50vh]">
    <div class="text-center space-y-3">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
      <p class="text-xs font-medium text-slate-500">Memuat profil pedagang...</p>
    </div>
  </div>

  <!-- Not Found / Error State -->
  <div v-else class="flex items-center justify-center py-20">
    <Card class="max-w-sm border-slate-200 dark:border-slate-700/60 text-center p-6 space-y-4">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
        <Icon name="lucide:store" class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Pedagang Tidak Ditemukan</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Data pedagang tidak tersedia atau telah dihapus dari sistem.</p>
      </div>
      <NuxtLink to="/merchants">
        <Button size="sm" class="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs">
          Kembali ke Daftar Pedagang
        </Button>
      </NuxtLink>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '~/utils/api'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MerchantLocationEdit from '~/components/MerchantLocationEdit.vue'

const route = useRoute()
const router = useRouter()
const merchantId = route.params.uuid
const merchant = ref<any>(null)
const loading = ref(true)

// Wallet
const wallet = ref<any>({ balance: 0, total_earned: 0, total_withdrawn: 0, transactions: [] })
const walletLoading = ref(false)

// Location edit
const showLocationEdit = ref(false)

// Delete location
const deletingLocation = ref(false)

// Merchant edit
const editing = ref(false)
const saving = ref(false)
const editForm = ref({
  name: '',
  store_name: '',
  phone_number: '',
  category_store: '',
  store_type: '',
  address: '',
  description: '',
})

// Store category options
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

// Store type options
const STORE_TYPES = [
  'Warung Kecil',
  'Toko Kelontong',
  'Distributor',
  'Toko Online',
  'Grosir',
]

// Delete
const showDeleteConfirm = ref(false)
const deleting = ref(false)

// Map
const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value || 0)
}

const fetchMerchant = async () => {
  loading.value = true
  try {
    const res = await api.get(`/admin/merchants/${merchantId}`)
    if (res) {
      merchant.value = res
      if (res.latitude && res.longitude) {
        nextTick(() => {
          initMap(res.latitude, res.longitude)
        })
      }
    }
  } catch (err) {
    console.error("Failed to fetch merchant details", err)
  } finally {
    loading.value = false
  }
}

const fetchWallet = async () => {
  walletLoading.value = true
  try {
    const res = await api.get(`/admin/merchants/${merchantId}/wallet`)
    if (res) {
      wallet.value = res
    }
  } catch (err) {
    console.error("Failed to fetch wallet", err)
  } finally {
    walletLoading.value = false
  }
}

const deleteMerchant = async () => {
  deleting.value = true
  try {
    await api.delete(`/admin/merchants/${merchantId}`)
    showDeleteConfirm.value = false
    router.push('/merchants')
  } catch (err) {
    console.error("Failed to delete merchant", err)
    alert('Gagal menonaktifkan merchant.')
  } finally {
    deleting.value = false
  }
}

const onLocationSaved = (updated: any) => {
  showLocationEdit.value = false
  if (merchant.value) {
    merchant.value.latitude = updated.latitude
    merchant.value.longitude = updated.longitude
    merchant.value.address = updated.address
  }
  if (merchant.value?.latitude && merchant.value?.longitude) {
    nextTick(() => {
      initMap(merchant.value.latitude, merchant.value.longitude)
    })
  }
}

const startEdit = () => {
  if (!merchant.value) return
  editForm.value = {
    name: merchant.value.name || '',
    store_name: merchant.value.store_name || '',
    phone_number: merchant.value.phone_number || '',
    category_store: merchant.value.category_store || 'Makanan & Minuman',
    store_type: merchant.value.store_type || 'Warung Kecil',
    address: merchant.value.address || '',
    description: merchant.value.description || '',
  }
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const saveEdit = async () => {
  saving.value = true
  try {
    const res = await api.patch(`/admin/merchants/${merchantId}`, editForm.value)
    if (res) {
      await fetchMerchant()
      editing.value = false
    }
  } catch (err) {
    console.error("Failed to update merchant", err)
    alert('Gagal memperbarui data pedagang.')
  } finally {
    saving.value = false
  }
}

const deleteLocation = async () => {
  if (!confirm('Hapus lokasi merchant? Latitude dan longitude akan direset.')) return
  deletingLocation.value = true
  try {
    await api.delete(`/admin/location/${merchantId}`)
    if (merchant.value) {
      merchant.value.latitude = null
      merchant.value.longitude = null
    }
  } catch (err) {
    console.error("Failed to delete location", err)
    alert('Gagal menghapus lokasi.')
  } finally {
    deletingLocation.value = false
  }
}

const initMap = (lat: number, lng: number) => {
  if (!mapContainer.value) return

  if (map) {
    map.remove()
    map = null
  }

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap'
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    center: [lng, lat],
    zoom: 15
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  const el = document.createElement('div')
  el.className = 'w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-md'

  new maplibregl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map)

  map.on('load', () => {
    map!.resize()
  })
}

onMounted(() => {
  fetchMerchant()
  fetchWallet()
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>
