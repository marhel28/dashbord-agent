<template>
  <div class="animate-fade-in max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black uppercase tracking-tight" style="color: var(--wp-navy);">Profil Pengguna</h1>
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Kelola informasi akun dan profil Anda</p>
      </div>
    </div>

    <!-- Profile Info Card -->
    <div class="bg-white dark:bg-slate-800 border border-[var(--wp-border)] rounded shadow-sm overflow-hidden">
      <div class="p-6 md:p-8 border-b border-[var(--wp-border)] bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row items-center gap-6">
        <!-- Profile Picture Area -->
        <div class="relative group">
          <div v-if="user?.photo_profile" class="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
            <img :src="user.photo_profile" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center text-3xl font-black text-white" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark));">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
        </div>

        <div class="text-center md:text-left flex-1">
          <h2 class="text-2xl font-black text-[var(--wp-navy)] dark:text-white">{{ user?.name }}</h2>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{{ user?.role }}</p>
          <div class="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded" style="background: rgba(212,168,67,0.1); color: var(--wp-gold-dark);">
              <Icon name="heroicons:envelope" class="w-3.5 h-3.5" />
              {{ user?.email }}
            </span>
            <span v-if="user?.phone_number" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <Icon name="heroicons:phone" class="w-3.5 h-3.5" />
              {{ user?.phone_number }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="p-6 md:p-8">
        <form @submit.prevent="handleUpdateProfile" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Lengkap</label>
              <input v-model="form.name" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" required />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nomor Telepon</label>
              <input v-model="form.phone_number" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Toko / Bisnis</label>
              <input v-model="form.store_name" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" required />
            </div>
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Alamat</label>
              <input v-model="form.address" type="text" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors" required />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Deskripsi Toko</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 text-sm border border-[var(--wp-border)] bg-[var(--wp-bg)] text-[var(--wp-text)] rounded focus:outline-none focus:border-[var(--wp-gold)] transition-colors resize-none"></textarea>
          </div>

          <!-- Peta Lokasi -->
          <div class="space-y-2 pt-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Lokasi Toko (Peta)</label>
              <button type="button" @click="getCurrentLocation" class="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white rounded shadow-sm hover:opacity-90 transition w-fit" style="background: var(--wp-navy);">
                <Icon name="heroicons:map-pin" class="w-3.5 h-3.5" />
                <span>Gunakan Lokasi Saat Ini</span>
              </button>
            </div>
            <p class="text-[10px] text-slate-400 mb-2">Klik peta atau gunakan tombol di atas untuk menentukan koordinat lokasi toko Anda.</p>
            <div class="grid grid-cols-2 gap-4 mb-2">
              <div class="space-y-1.5">
                <label class="block text-[9px] font-bold uppercase text-slate-400">Latitude</label>
                <input v-model="form.latitude" type="number" step="any" readonly class="w-full px-3 py-1.5 text-xs border border-[var(--wp-border)] bg-slate-50 dark:bg-slate-800 text-slate-500 rounded" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-[9px] font-bold uppercase text-slate-400">Longitude</label>
                <input v-model="form.longitude" type="number" step="any" readonly class="w-full px-3 py-1.5 text-xs border border-[var(--wp-border)] bg-slate-50 dark:bg-slate-800 text-slate-500 rounded" />
              </div>
            </div>
            <div ref="mapContainer" class="w-full h-64 border border-[var(--wp-border)] rounded-md overflow-hidden relative z-0"></div>
          </div>

          <!-- Error / Success Messages -->
          <div v-if="errorMsg" class="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded border border-rose-100 flex items-center gap-2">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            <span>{{ errorMsg }}</span>
          </div>
          <div v-if="successMsg" class="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded border border-emerald-100 flex items-center gap-2">
            <Icon name="heroicons:check-circle" class="w-4 h-4" />
            <span>{{ successMsg }}</span>
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" style="background: linear-gradient(135deg, var(--wp-gold), var(--wp-gold-dark)); border-radius: 4px;">
              <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <Icon v-else name="heroicons:check" class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const { user, fetchMe, updateProfile } = useAuth()
const config = useRuntimeConfig()
const router = useRouter()

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
const errorMsg = ref('')
const successMsg = ref('')

// Map variables
const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null
let marker: maplibregl.Marker | null = null

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    errorMsg.value = 'Geolokasi tidak didukung oleh browser Anda'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      form.value.latitude = Number(lat.toFixed(6))
      form.value.longitude = Number(lng.toFixed(6))
      
      if (map) {
        map.flyTo({ center: [lng, lat], zoom: 16 })
        updateMarker(lng, lat)
      }
      
      successMsg.value = 'Lokasi berhasil didapatkan!'
      setTimeout(() => successMsg.value = '', 3000)
    },
    (error) => {
      let msg = 'Gagal mendapatkan lokasi.'
      if (error.code === 1) msg = 'Akses lokasi ditolak.'
      else if (error.code === 2) msg = 'Posisi tidak tersedia.'
      else if (error.code === 3) msg = 'Waktu permintaan lokasi habis.'
      errorMsg.value = msg
    },
    { enableHighAccuracy: true }
  )
}

const updateMarker = (lng: number, lat: number) => {
  if (!marker) {
    marker = new maplibregl.Marker({ color: '#D4A843', draggable: true })
      .setLngLat([lng, lat])
      .addTo(map!)
    
    // Update coordinates when marker is dragged
    marker.on('dragend', () => {
      const lngLat = marker!.getLngLat()
      form.value.longitude = Number(lngLat.lng.toFixed(6))
      form.value.latitude = Number(lngLat.lat.toFixed(6))
    })
  } else {
    marker.setLngLat([lng, lat])
  }
}

onMounted(async () => {
  if (!user.value) {
    try {
      await fetchMe()
    } catch (e) {
      // ignore
    }
  }
  
  if (!user.value) {
    router.push('/login')
    return
  }

  if (user.value) {
    form.value = {
      name: user.value.name || '',
      phone_number: user.value.phone_number || '',
      store_name: user.value.store_name || '',
      address: user.value.address || '',
      description: user.value.description || '',
      latitude: user.value.latitude || null,
      longitude: user.value.longitude || null
    }
  }

  // Initialize MapLibre
  if (mapContainer.value) {
    // Default to Indonesia center if no coordinate
    const defaultLat = form.value.latitude || -2.5489
    const defaultLng = form.value.longitude || 118.0149
    const defaultZoom = form.value.latitude ? 15 : 4

    map = new maplibregl.Map({
      container: mapContainer.value,
      style: {
        version: 8,
        sources: {
          'google': {
            type: 'raster',
            tiles: [
              'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            attribution: 'Map data © Google'
          }
        },
        layers: [
          {
            id: 'google-maps',
            type: 'raster',
            source: 'google',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [defaultLng, defaultLat],
      zoom: defaultZoom
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Add initial marker if coordinate exists
    if (form.value.latitude && form.value.longitude) {
      updateMarker(form.value.longitude, form.value.latitude)
    }

    // Map click event to set new coordinates
    map.on('click', (e) => {
      const lng = e.lngLat.lng
      const lat = e.lngLat.lat
      
      form.value.longitude = Number(lng.toFixed(6))
      form.value.latitude = Number(lat.toFixed(6))
      
      updateMarker(lng, lat)
    })
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

const handleUpdateProfile = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  isSubmitting.value = true

  try {
    await updateProfile(form.value)
    successMsg.value = 'Profil berhasil diperbarui!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)

  } catch (error: any) {
    errorMsg.value = error.message || 'Terjadi kesalahan sistem'
  } finally {
    isSubmitting.value = false
  }
}
</script>
