<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Titik Lokasi Pedagang</h3>
        <Button variant="ghost" size="sm" @click="$emit('close')" class="h-8 w-8 p-0 rounded-lg text-slate-500">
          <Icon name="lucide:x" class="w-4 h-4" />
        </Button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Atur lokasi GPS untuk <strong class="text-slate-900 dark:text-slate-100">{{ merchant.store_name || merchant.name }}</strong>.
          Klik pada peta untuk menentukan koordinat, atau masukkan nilai manual.
        </p>

        <!-- Address -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Fisik</label>
          <textarea
            v-model="form.address"
            rows="2"
            class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none resize-none"
            placeholder="Masukkan alamat lengkap..."
          ></textarea>
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
            <input
              v-model.number="form.latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              class="w-full px-3 py-2 text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none"
              placeholder="-6.2088"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
            <input
              v-model.number="form.longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              class="w-full px-3 py-2 text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:border-emerald-500 outline-none"
              placeholder="106.8456"
            />
          </div>
        </div>

        <!-- Mini Map Picker -->
        <div class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[200px] relative bg-slate-100 dark:bg-slate-800">
          <div ref="pickerMapContainer" class="w-full h-full"></div>
          <div v-if="mapLoading" class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center">
            <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <p class="text-[11px] text-slate-400 text-center">
          Klik pada peta untuk mengatur koordinat. Geser marker biru untuk penyesuaian halus.
        </p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex gap-2 justify-end">
        <Button variant="outline" size="sm" @click="resetLocation" class="text-xs rounded-lg">
          Reset Titik
        </Button>
        <Button variant="outline" size="sm" @click="$emit('close')" class="text-xs rounded-lg">
          Batal
        </Button>
        <Button size="sm" @click="saveLocation" :disabled="saving" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5">
          <Icon v-if="saving" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ saving ? 'Menyimpan...' : 'Simpan Lokasi' }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { api } from '~/utils/api'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps<{
  merchant: any
}>()

const emit = defineEmits<{
  close: []
  saved: [data: any]
}>()

const form = ref({
  address: '',
  latitude: null as number | null,
  longitude: null as number | null,
})

const saving = ref(false)
const mapLoading = ref(true)
const pickerMapContainer = ref<HTMLElement | null>(null)
let pickerMap: maplibregl.Map | null = null
let marker: maplibregl.Marker | null = null

const initPickerMap = () => {
  if (!pickerMapContainer.value) return

  const lat = props.merchant.latitude || -6.2088
  const lng = props.merchant.longitude || 106.8456

  pickerMap = new maplibregl.Map({
    container: pickerMapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap'
        }
      },
      layers: [{ id: 'osm-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 19 }]
    },
    center: [lng, lat],
    zoom: props.merchant.latitude ? 15 : 4,
  })

  pickerMap.addControl(new maplibregl.NavigationControl(), 'top-right')

  const el = document.createElement('div')
  el.className = 'w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-md cursor-move'
  marker = new maplibregl.Marker({ element: el, draggable: true })
    .setLngLat([lng, lat])
    .addTo(pickerMap!)

  marker.on('dragend', () => {
    const lngLat = marker!.getLngLat()
    form.value.latitude = Math.round(lngLat.lat * 1000000) / 1000000
    form.value.longitude = Math.round(lngLat.lng * 1000000) / 1000000
  })

  pickerMap.on('click', (e) => {
    const { lat, lng } = e.lngLat
    form.value.latitude = Math.round(lat * 1000000) / 1000000
    form.value.longitude = Math.round(lng * 1000000) / 1000000
    marker!.setLngLat([lng, lat])
  })

  mapLoading.value = false
}

const saveLocation = async () => {
  saving.value = true
  try {
    const res = await api.put(`/admin/location/${props.merchant.uuid}`, {
      address: form.value.address,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
    })
    if (res) {
      emit('saved', res)
    }
  } catch (err) {
    console.error("Failed to save location", err)
    alert('Gagal menyimpan lokasi.')
  } finally {
    saving.value = false
  }
}

const resetLocation = async () => {
  if (!confirm('Reset lokasi merchant? Latitude dan longitude akan dihapus.')) return
  saving.value = true
  try {
    await api.delete(`/admin/location/${props.merchant.uuid}`)
    form.value.latitude = null
    form.value.longitude = null
    emit('saved', { latitude: null, longitude: null, address: form.value.address })
  } catch (err) {
    console.error("Failed to reset location", err)
    alert('Gagal reset lokasi.')
  } finally {
    saving.value = false
  }
}

watch([() => form.value.latitude, () => form.value.longitude], ([lat, lng]) => {
  if (lat && lng && marker && pickerMap) {
    marker.setLngLat([lng, lat])
    pickerMap.setCenter([lng, lat])
  }
})

onMounted(() => {
  form.value.address = props.merchant.address || ''
  form.value.latitude = props.merchant.latitude || null
  form.value.longitude = props.merchant.longitude || null
  nextTick(() => {
    initPickerMap()
  })
})

onUnmounted(() => {
  if (pickerMap) {
    pickerMap.remove()
    pickerMap = null
  }
})
</script>
