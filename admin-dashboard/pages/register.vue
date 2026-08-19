<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import type { RegisterPayload } from '../composables/useAuth'

definePageMeta({ layout: 'auth' })

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  phone_number: '',
  store_name: '',
  address: '',
  role: 'admin',
  description: '',
  latitude: -6.200000,
  longitude: 106.816666,
})

const showPassword = ref(false)
const loading = ref(false)
const detecting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const registered = ref(false)

// Multi-step form
const currentStep = ref(1)

const step1Valid = computed(() =>
  form.name.trim() &&
  form.email.trim() &&
  form.password.length >= 8 &&
  form.phone_number.trim()
)
const step2Valid = computed(() =>
  form.store_name.trim() && form.address.trim()
)

const { register: doRegister, verifyEmail } = useAuth()
const colorMode = useColorMode()

const logoSrc = computed(() => {
  return colorMode.value === 'dark' ? '/logo_darkmode.png' : '/logo_lightmode.png'
})

const detectLocation = () => {
  if (!navigator.geolocation) {
    errorMsg.value = 'Browser Anda tidak mendukung geolokasi'
    return
  }
  detecting.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.latitude = parseFloat(pos.coords.latitude.toFixed(6))
      form.longitude = parseFloat(pos.coords.longitude.toFixed(6))
      detecting.value = false
    },
    () => {
      detecting.value = false
      errorMsg.value = 'Gagal mendeteksi lokasi. Masukkan koordinat manual.'
    },
    { enableHighAccuracy: true, timeout: 5000 }
  )
}

const nextStep = () => {
  if (currentStep.value === 1 && step1Valid.value) {
    errorMsg.value = ''
    currentStep.value = 2
  }
}
const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const handleRegister = async () => {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const data = await doRegister(form)
    if (data?.verification_token) {
      try { await verifyEmail(data.verification_token) } catch { /* ignore */ }
    }
    successMsg.value = 'Akun administrator berhasil dibuat!'
    registered.value = true
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registrasi gagal. Silakan coba lagi.'
    errorMsg.value = message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <!-- Header -->
    <header class="w-full border-b border-border bg-card">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img :src="logoSrc" class="h-8 w-8 object-contain shrink-0" alt="Nahkoda Logo" />
          <div class="flex flex-col">
            <span class="text-base font-extrabold leading-none text-foreground">Nahkoda</span>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Admin Registration</span>
          </div>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <NuxtLink to="/login" class="text-xs font-semibold text-muted-foreground hover:text-foreground transition">
            Sudah punya akun? Masuk
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <!-- Success View -->
      <Card v-if="registered" class="w-full max-w-md animate-fade-in text-center p-8 space-y-5 border-slate-200/80 dark:border-slate-700/60 shadow-md">
        <div class="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Icon name="lucide:check-circle-2" class="w-8 h-8" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Registrasi Berhasil!</h2>
          <p class="text-xs text-muted-foreground mt-1">Akun administrator platform Anda telah siap digunakan.</p>
        </div>
        <NuxtLink to="/login">
          <Button class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg h-10 shadow-xs">
            Masuk ke Command Center
          </Button>
        </NuxtLink>
      </Card>

      <!-- Register Form -->
      <Card v-else class="w-full max-w-lg animate-fade-in-up border-slate-200/80 dark:border-slate-700/60 shadow-md">
        <CardHeader class="pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img :src="logoSrc" class="h-9 w-9 object-contain shrink-0" alt="Nahkoda Logo" />
              <div>
                <CardTitle class="text-base leading-tight text-card-foreground">Daftar Admin Baru</CardTitle>
                <CardDescription class="text-xs">Langkah {{ currentStep }} dari 2</CardDescription>
              </div>
            </div>
            <div class="flex gap-1">
              <span :class="['w-6 h-1.5 rounded-full transition-colors', currentStep === 1 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700']"></span>
              <span :class="['w-6 h-1.5 rounded-full transition-colors', currentStep === 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700']"></span>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <!-- Error banner -->
          <div
            v-if="errorMsg"
            class="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2"
          >
            <Icon name="lucide:alert-circle" class="h-4 w-4 shrink-0 mt-0.5" />
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Step 1: Account Information -->
          <div v-if="currentStep === 1" class="space-y-4">
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
              <Input v-model="form.name" type="text" placeholder="cth: Ahmad Fauzi" class="text-xs" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Email Akun</Label>
              <Input v-model="form.email" type="email" placeholder="admin@nahkoda.id" class="text-xs" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nomor Telepon</Label>
              <Input v-model="form.phone_number" type="tel" placeholder="08123456789" class="text-xs font-mono" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi (Min. 8 Karakter)</Label>
              <div class="relative">
                <Input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="text-xs pr-10" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button @click="nextStep" :disabled="!step1Valid" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg h-10 shadow-xs mt-2">
              Lanjutkan ke Data Instansi &rarr;
            </Button>
          </div>

          <!-- Step 2: Store / Agency Info -->
          <div v-else-if="currentStep === 2" class="space-y-4">
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Instansi / Entitas Admin</Label>
              <Input v-model="form.store_name" type="text" placeholder="cth: Tim Pengawas UMKM" class="text-xs" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Alamat Kantor / Domisili</Label>
              <Input v-model="form.address" type="text" placeholder="cth: Jl. Sudirman No. 10" class="text-xs" />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <Label class="text-xs font-bold text-slate-700 dark:text-slate-300">Koordinat Kantor</Label>
                <button type="button" @click="detectLocation" class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                  <Icon name="lucide:crosshair" class="w-3.5 h-3.5" />
                  <span>{{ detecting ? 'Mendeteksi...' : 'Deteksi GPS Otomatis' }}</span>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <Input v-model.number="form.latitude" type="number" step="any" placeholder="Latitude" class="text-xs font-mono" />
                <Input v-model.number="form.longitude" type="number" step="any" placeholder="Longitude" class="text-xs font-mono" />
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <Button variant="outline" @click="prevStep" class="text-xs rounded-lg">
                &larr; Kembali
              </Button>
              <Button @click="handleRegister" :disabled="!step2Valid || loading" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg h-10 shadow-xs flex items-center justify-center gap-2">
                <Icon v-if="loading" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
                <span>{{ loading ? 'Mendaftarkan Akun...' : 'Selesaikan Pendaftaran' }}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
