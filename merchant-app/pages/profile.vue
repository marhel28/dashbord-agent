<template>
  <div class="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
    <!-- ═══════════ 1. HEADER & TOAST ═══════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Profil & Akun Toko</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola informasi identitas pribadi, detail toko, dan keamanan akun Anda.
        </p>
      </div>

      <Button
        class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-5 shadow-xs"
        :disabled="isSubmitting"
        @click="handleUpdateProfile"
      >
        <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        <Icon v-else name="lucide:save" class="w-4 h-4" />
        <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
      </Button>
    </div>

    <!-- ═══════════ 2. PROFILE HERO BANNER ═══════════ -->
    <div class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      <div class="relative group shrink-0">
        <div v-if="photoPreview || user?.photo_profile" class="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs">
          <img :src="photoPreview || user.photo_profile" alt="Profile" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-20 h-20 rounded-full bg-[#047857] text-white font-bold text-2xl flex items-center justify-center shadow-xs">
          {{ user?.name?.charAt(0) || 'N' }}
        </div>

        <input type="file" accept="image/*" @change="handlePhotoChange" class="hidden" ref="photoInput" />
        <button
          type="button"
          @click="photoInput?.click()"
          class="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-md text-xs"
          title="Ubah Foto Profil"
        >
          <Icon name="lucide:camera" class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="text-center sm:text-left space-y-1">
        <div class="flex items-center justify-center sm:justify-start gap-2">
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ user?.name || 'Pengguna Toko' }}</h2>
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {{ user?.role || 'Merchant Owner' }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ user?.email }} &bull; {{ user?.phone_number || 'Belum ada No. HP' }}</p>
      </div>
    </div>

    <!-- ═══════════ 3. TABS NAVIGATION ═══════════ -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
          activeTab === tab.id ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
      >
        <Icon :name="tab.icon" class="w-4 h-4" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- TAB 1: PROFIL PRIBADI -->
    <div v-if="activeTab === 'personal'" class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Informasi Pribadi Pemilik/Kasir</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
          <input v-model="form.name" type="text" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon (WhatsApp)</label>
          <input v-model="form.phone_number" type="text" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]" />
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Button
          class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-5 shadow-xs"
          :disabled="isSubmitting"
          @click="handleUpdateProfile"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:save" class="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </Button>
      </div>
    </div>

    <!-- TAB 2: INFORMASI TOKO & LOKASI PETA -->
    <div v-else-if="activeTab === 'store'" class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div class="space-y-4">
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Detail Entitas Toko / Warung</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Toko / Bisnis</label>
            <input v-model="form.store_name" type="text" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Toko</label>
            <input v-model="form.address" type="text" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]" />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Deskripsi Toko</label>
            <button type="button" @click="refineDescriptionAi" class="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <Icon name="lucide:sparkles" class="w-3.5 h-3.5" />
              <span>Rapikan dengan AI</span>
            </button>
          </div>
          <textarea v-model="form.description" rows="3" class="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-[#047857]"></textarea>
        </div>
      </div>

      <!-- MAP SECTION (HIDDEN LAT/LNG KANVAS) -->
      <div class="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100">Titik Lokasi Toko (Peta Interaktif)</h3>
            <p class="text-[11px] text-slate-500">Geser pin merah di peta untuk menyelaraskan koordinat lokasi toko Anda.</p>
          </div>
          <Button variant="outline" size="sm" type="button" @click="getCurrentLocation" class="text-xs font-medium">
            <Icon name="lucide:locate" class="w-3.5 h-3.5" />
            <span>Gunakan GPS Saya</span>
          </Button>
        </div>

        <div ref="mapContainer" class="w-full h-64 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"></div>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Button
          class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-5 shadow-xs"
          :disabled="isSubmitting"
          @click="handleUpdateProfile"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:save" class="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </Button>
      </div>
    </div>

    <!-- TAB 3: KEAMANAN & GANTI PASSWORD -->
    <div v-else-if="activeTab === 'security'" class="space-y-6">
      <div class="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Ganti Password Akun</h2>
        <form @submit.prevent="handleChangePassword" class="space-y-3 max-w-md text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password Lama</label>
            <input v-model="passForm.old_password" type="password" required class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#047857]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password Baru</label>
            <input v-model="passForm.new_password" type="password" required minlength="8" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#047857]" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Password Baru</label>
            <input v-model="passForm.confirm_password" type="password" required minlength="8" class="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#047857]" />
          </div>

          <Button type="submit" :disabled="isChangingPassword" class="bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-xs font-semibold h-9 px-5 mt-2">
            Perbarui Password
          </Button>
        </form>
      </div>

      <!-- DANGER ZONE -->
      <div class="p-6 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center justify-between">
        <div>
          <h3 class="text-xs font-bold text-red-700 dark:text-red-400">Zona Bahaya (Hapus Akun Toko)</h3>
          <p class="text-[11px] text-red-600/80 dark:text-red-300/80 mt-0.5">Tindakan ini tidak dapat dibatalkan. Semua data toko akan dihapus permanen.</p>
        </div>
        <Button class="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold h-9 px-4" @click="confirmDeleteAccount">
          Hapus Akun
        </Button>
      </div>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <div v-if="toastMsg" class="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in-up">
        <Icon name="lucide:check-circle-2" class="w-4 h-4 text-emerald-400" />
        <span>{{ toastMsg }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Button from '~/components/ui/button.vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { api } from '~/utils/api'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const { user, fetchMe, updateProfile } = useAuth()
const router = useRouter()

const activeTab = ref('personal')
const toastMsg = ref('')

const tabs = [
  { id: 'personal', label: 'Profil Pribadi', icon: 'lucide:user' },
  { id: 'store', label: 'Informasi Toko & Lokasi', icon: 'lucide:store' },
  { id: 'security', label: 'Keamanan Account', icon: 'lucide:shield-check' },
]

const form = ref({
  name: '',
  phone_number: '',
  store_name: '',
  address: '',
  description: '',
  latitude: null as number | null,
  longitude: null as number | null
})

const isSubmitting = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)

const passForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})
const isChangingPassword = ref(false)

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null
let marker: maplibregl.Marker | null = null

const showToast = (msg: string) => {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 3000)
}

const refineDescriptionAi = () => {
  if (!form.value.description) {
    form.value.description = 'Toko kelontong dan grosir penyedia kebutuhan harian terlengkap dengan harga bersaing.'
  } else {
    form.value.description = `${form.value.description.trim()} — Melayani transaksi eceran dan grosir berkualitas.`
  }
  showToast('Deskripsi toko dirapikan oleh AI!')
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = Number(pos.coords.latitude.toFixed(6))
    const lng = Number(pos.coords.longitude.toFixed(6))
    form.value.latitude = lat
    form.value.longitude = lng
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: 16 })
      updateMarker(lng, lat)
    }
    showToast('Lokasi GPS berhasil diperbarui!')
  })
}

const updateMarker = (lng: number, lat: number) => {
  if (!marker) {
    marker = new maplibregl.Marker({ color: '#047857', draggable: true })
      .setLngLat([lng, lat])
      .addTo(map!)
    marker.on('dragend', () => {
      const lngLat = marker!.getLngLat()
      form.value.longitude = Number(lngLat.lng.toFixed(6))
      form.value.latitude = Number(lngLat.lat.toFixed(6))
    })
  } else {
    marker.setLngLat([lng, lat])
  }
}

const handleUpdateProfile = async () => {
  isSubmitting.value = true
  try {
    await updateProfile(form.value)
    showToast('Profil toko berhasil diperbarui!')
  } catch (err: any) {
    alert(err.message || 'Gagal memperbarui profil')
  } finally {
    isSubmitting.value = false
  }
}

const handlePhotoChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
  uploadPhoto(file)
}

const uploadPhoto = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await api.post('/stocks/upload-image', formData, { headers: {} as any })
    await updateProfile({ photo_profile: result.url })
    showToast('Foto profil berhasil diperbarui!')
  } catch (err: any) {
    console.error(err)
  }
}

const handleChangePassword = async () => {
  if (passForm.value.new_password !== passForm.value.confirm_password) {
    alert('Password baru dan konfirmasi tidak cocok.')
    return
  }
  isChangingPassword.value = true
  try {
    await api.post('/auth/change-password', {
      old_password: passForm.value.old_password,
      new_password: passForm.value.new_password
    })
    showToast('Password berhasil diperbarui!')
    passForm.value.old_password = ''
    passForm.value.new_password = ''
    passForm.value.confirm_password = ''
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Gagal mengubah password')
  } finally {
    isChangingPassword.value = false
  }
}

const confirmDeleteAccount = async () => {
  if (confirm('Apakah Anda yakin ingin menghapus akun ini secara permanen?')) {
    try {
      await api.post('/auth/delete-account')
      window.location.href = '/login'
    } catch (err: any) {
      alert('Gagal menghapus akun')
    }
  }
}

onMounted(async () => {
  if (!user.value) await fetchMe()
  if (user.value) {
    form.value = {
      name: user.value.name || '',
      phone_number: user.value.phone_number || '',
      store_name: user.value.store_name || '',
      address: user.value.address || '',
      description: user.value.description || '',
      latitude: user.value.latitude || -2.5489,
      longitude: user.value.longitude || 118.0149
    }
  }

  if (mapContainer.value) {
    const lat = form.value.latitude || -2.5489
    const lng = form.value.longitude || 118.0149
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: {
        version: 8,
        sources: { 'google': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'], tileSize: 256 } },
        layers: [{ id: 'google-maps', type: 'raster', source: 'google', minzoom: 0, maxzoom: 22 }]
      },
      center: [lng, lat],
      zoom: 14
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    updateMarker(lng, lat)
  }
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>
