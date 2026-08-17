<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import type { RegisterPayload } from '../composables/useAuth'

definePageMeta({ layout: 'auth' })

const storeCategories = [
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

const storeTypes = [
  'Warung Kecil',
  'Toko Kelontong',
  'Distributor',
  'Toko Online',
  'Grosir',
]

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  phone_number: '',
  store_name: '',
  category_store: 'Makanan & Minuman',
  store_type: 'Warung Kecil',
  address: '',
  role: 'penjual',
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
const totalSteps = 2

const step1Valid = computed(() =>
  form.name.trim() &&
  form.email.trim() &&
  form.password.length >= 8 &&
  form.phone_number.trim()
)
const step2Valid = computed(() =>
  form.store_name.trim() && form.address.trim()
)

const { register: doRegister, verifyEmail, login: doLogin } = useAuth()

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

const formatCallbackError = (err: any): string => {
  if (typeof err === 'string') return err
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message)
      if (Array.isArray(parsed?.detail)) {
        return parsed.detail
          .map((d: any) => {
            const field = Array.isArray(d.loc) ? d.loc.filter((l: any) => l !== 'body' && l !== 'query').join(' -> ') : ''
            const reason = d.ctx?.reason || d.msg || 'Format data tidak valid'
            return field ? `[${field}] ${reason}` : reason
          })
          .join('\n')
      }
    } catch (_) { /* not json */ }
    return err.message
  }
  return 'Registrasi gagal. Silakan periksa kembali data Anda.'
}

const handleRegister = async () => {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const data = await doRegister(form)
    if (data?.verification_token) {
      try { await verifyEmail(data.verification_token) } catch { /* ignore verification error if auto verified */ }
    }

    await doLogin(form.email, form.password)
    await navigateTo('/dashboard')
  } catch (err: unknown) {
    errorMsg.value = formatCallbackError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <!-- Navigation Header -->
    <header class="w-full border-b border-border bg-background">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img src="/logo_lightmode.png" class="h-8 w-8 object-contain shrink-0" alt="Nahkoda Logo" />
          <div class="flex flex-col">
            <span class="text-base font-extrabold leading-none text-foreground">Nahkoda</span>
            <span class="text-xs font-semibold text-primary">Business Copilot</span>
          </div>
        </NuxtLink>

        <nav class="flex items-center gap-6">
          <NuxtLink to="/" class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Beranda</NuxtLink>
          <NuxtLink to="/login" class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Masuk Merchant</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main -->
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <Card class="w-full max-w-lg animate-fade-in-up">
        <!-- Brand Header -->
        <CardHeader>
          <div class="flex items-center gap-3">
            <img src="/logo_lightmode.png" class="h-10 w-10 object-contain shrink-0" alt="Nahkoda AI Logo" />
            <div class="flex flex-col">
              <CardTitle class="text-base leading-tight text-card-foreground">Nahkoda AI</CardTitle>
              <CardDescription class="leading-tight">Business Copilot Merchant Platform</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <!-- Step indicator -->
          <div class="mb-6 flex items-center" aria-label="Progress pendaftaran">
            <template v-for="s in totalSteps" :key="s">
              <div class="flex flex-col items-center gap-1">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors"
                  :class="{
                    'border-primary bg-primary text-primary-foreground': s < currentStep || registered,
                    'border-primary bg-primary/10 text-primary': s === currentStep && !registered,
                    'border-border bg-muted text-muted-foreground': s > currentStep && !registered
                  }"
                >
                  <Icon v-if="s < currentStep || registered" name="heroicons:check-solid" class="h-3.5 w-3.5" />
                  <span v-else>{{ s }}</span>
                </div>
                <span
                  class="text-xs font-medium whitespace-nowrap"
                  :class="{
                    'text-primary font-bold': s === currentStep && !registered,
                    'text-foreground': s < currentStep || registered,
                    'text-muted-foreground': s > currentStep && !registered
                  }"
                >
                  {{ s === 1 ? 'Data Akun' : 'Info Toko' }}
                </span>
              </div>
              <div
                v-if="s < totalSteps"
                class="mx-3 h-0.5 flex-1 rounded-full transition-colors"
                :class="{ 'bg-primary': currentStep > 1 || registered, 'bg-border': currentStep <= 1 && !registered }"
              ></div>
            </template>
          </div>

          <!-- Error message -->
          <Transition name="msg-slide">
            <div
              v-if="errorMsg"
              class="mb-4 rounded-md border border-[var(--destructive-border)] bg-[var(--destructive-bg)] px-3 py-2.5 text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              <div class="flex items-start gap-2">
                <Icon name="heroicons:exclamation-circle-solid" class="h-4 w-4 shrink-0 mt-0.5" />
                <span>{{ errorMsg }}</span>
              </div>
            </div>
          </Transition>

          <!-- ── SUCCESS STATE ── -->
          <Transition name="msg-slide">
            <div v-if="registered" class="flex flex-col items-center py-6 text-center">
              <div class="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-bg)]">
                <Icon name="heroicons:check-circle-solid" class="h-8 w-8 text-success" />
              </div>
              <h2 class="text-xl font-bold text-foreground">Akun Berhasil Dibuat!</h2>
              <p class="mt-1 text-sm text-muted-foreground">Selamat bergabung di Nahkoda AI. Silakan masuk dengan akun Anda.</p>
              <NuxtLink
                to="/login"
                class="mt-5 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                id="btn-goto-login"
              >
                <Icon name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" />
                <span>Masuk Sekarang</span>
              </NuxtLink>
            </div>
          </Transition>

          <!-- ── STEP 1: Data Akun ── -->
          <Transition name="step-slide">
            <form
              v-if="!registered && currentStep === 1"
              @submit.prevent="nextStep"
              novalidate
              class="space-y-4"
              key="step1"
            >
              <h2 class="text-lg font-bold tracking-tight text-foreground">Informasi Akun</h2>

              <!-- Role Badge (Pedagang Only) -->
              <div class="rounded-lg border border-primary/30 bg-accent p-3">
                <div class="flex items-center gap-3">
                  <Icon name="heroicons:building-storefront-solid" class="h-5 w-5 shrink-0 text-primary" />
                  <div class="flex-1">
                    <span class="block text-sm font-semibold text-foreground">Pedagang / Penjual</span>
                    <span class="block text-xs text-muted-foreground">Pendaftaran akun khusus Pemilik Toko & Pedagang</span>
                  </div>
                  <Icon name="heroicons:check-circle-solid" class="h-5 w-5 shrink-0 text-primary" />
                </div>
              </div>

              <!-- Name -->
              <div class="space-y-2">
                <Label for="reg-name">
                  Nama Lengkap <span class="text-destructive">*</span>
                </Label>
                <div class="relative">
                  <Icon name="heroicons:user" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input id="reg-name" v-model="form.name" type="text" required placeholder="Budi Santoso" class="pl-9" />
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-2">
                <Label for="reg-email">
                  Email Toko / Pemilik <span class="text-destructive">*</span>
                </Label>
                <div class="relative">
                  <Icon name="heroicons:envelope" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input id="reg-email" v-model="form.email" type="email" autocomplete="email" required placeholder="budi@warungmakmur.com" class="pl-9" />
                </div>
              </div>

              <!-- Phone Number -->
              <div class="space-y-2">
                <Label for="reg-phone">
                  Nomor Telepon / WA <span class="text-destructive">*</span>
                </Label>
                <div class="relative">
                  <Icon name="heroicons:phone" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input id="reg-phone" v-model="form.phone_number" type="tel" autocomplete="tel" required placeholder="081234567890" class="pl-9" />
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-2">
                <Label for="reg-password">
                  Kata Sandi <span class="text-destructive">*</span>
                </Label>
                <div class="relative">
                  <Icon name="heroicons:lock-closed" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    id="reg-password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    placeholder="Minimal 8 karakter"
                    class="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  >
                    <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="h-4 w-4" />
                  </button>
                </div>

                <!-- Password strength bar -->
                <div v-if="form.password" class="flex items-center gap-2">
                  <div class="flex flex-1 gap-1">
                    <div
                      v-for="b in 3"
                      :key="b"
                      class="h-1.5 flex-1 rounded-full transition-colors"
                      :class="{
                        'bg-primary':
                          (b === 1 && form.password.length >= 4) ||
                          (b === 2 && form.password.length >= 8) ||
                          (b === 3 && form.password.length >= 12 && /[A-Z]/.test(form.password)),
                        'bg-muted': !(
                          (b === 1 && form.password.length >= 4) ||
                          (b === 2 && form.password.length >= 8) ||
                          (b === 3 && form.password.length >= 12 && /[A-Z]/.test(form.password))
                        )
                      }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium text-muted-foreground">
                    {{
                      form.password.length < 8
                        ? 'Kurang kuat (min 8 char)'
                        : form.password.length >= 12
                        ? 'Kuat'
                        : 'Cukup'
                    }}
                  </span>
                </div>
              </div>

              <!-- Next Step Button -->
              <Button type="submit" :disabled="!step1Valid" class="w-full" id="btn-reg-next">
                <span>Lanjut: Informasi Toko</span>
                <Icon name="heroicons:arrow-right" class="h-4 w-4" />
              </Button>

              <p class="pt-2 text-center text-sm text-muted-foreground">
                Sudah punya akun?
                <NuxtLink to="/login" class="font-semibold text-primary hover:text-primary/80 transition-colors">Masuk di sini</NuxtLink>
              </p>
            </form>
          </Transition>

          <!-- ── STEP 2: Informasi Toko ── -->
          <Transition name="step-slide">
            <form
              v-if="!registered && currentStep === 2"
              @submit.prevent="handleRegister"
              novalidate
              class="space-y-4"
              key="step2"
            >
              <div class="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" @click="prevStep" aria-label="Kembali ke langkah 1">
                  <Icon name="heroicons:arrow-left" class="h-4 w-4" />
                </Button>
                <h2 class="text-lg font-bold tracking-tight text-foreground">Informasi Toko / Usaha</h2>
              </div>

              <!-- Store Name -->
              <div class="space-y-2">
                <Label for="reg-store-name">
                  Nama Toko / Usaha <span class="text-destructive">*</span>
                </Label>
                <div class="relative">
                  <Icon name="heroicons:building-storefront" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input id="reg-store-name" v-model="form.store_name" type="text" required placeholder="Warung Sembako Makmur" class="pl-9" />
                </div>
              </div>

              <!-- Store Type & Category row -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="reg-store-type">Tipe Usaha</Label>
                  <Select id="reg-store-type" v-model="form.store_type">
                    <option v-for="t in storeTypes" :key="t" :value="t">{{ t }}</option>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label for="reg-category">Kategori Produk</Label>
                  <Select id="reg-category" v-model="form.category_store">
                    <option v-for="c in storeCategories" :key="c" :value="c">{{ c }}</option>
                  </Select>
                </div>
              </div>

              <!-- Address -->
              <div class="space-y-2">
                <Label for="reg-address">
                  Alamat Toko <span class="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reg-address"
                  v-model="form.address"
                  rows="2"
                  required
                  placeholder="Jl. Merdeka No. 12, Kel. Menteng, Jakarta Pusat"
                  class="resize-none"
                />
              </div>

              <!-- Location Coordinates (GPS) -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label class="normal-case tracking-normal">
                    Koordinat Lokasi (GPS) <span class="text-xs font-normal text-muted-foreground">(opsional)</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="detectLocation"
                    :disabled="detecting"
                  >
                    <Icon :name="detecting ? 'heroicons:arrow-path' : 'heroicons:map-pin'" class="h-3.5 w-3.5" :class="{ 'animate-spin': detecting }" />
                    <span>{{ detecting ? 'Mendeteksi...' : 'Deteksi Lokasi Saya' }}</span>
                  </Button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <Input v-model.number="form.latitude" type="number" step="any" placeholder="Latitude (-6.2000)" />
                  <Input v-model.number="form.longitude" type="number" step="any" placeholder="Longitude (106.8166)" />
                </div>
              </div>

              <!-- Description (Optional) -->
              <div class="space-y-2">
                <Label for="reg-desc">
                  Deskripsi Toko <span class="text-xs font-normal tracking-normal text-muted-foreground">(opsional)</span>
                </Label>
                <Input id="reg-desc" v-model="form.description" type="text" placeholder="Menjual sembako murah, beras, minyak goreng..." />
              </div>

              <!-- Submit Button -->
              <Button type="submit" :disabled="loading || !step2Valid" class="w-full" id="btn-reg-submit">
                <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>
                <Icon v-else name="heroicons:check-circle" class="h-4 w-4" aria-hidden="true" />
                <span>{{ loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Merchant' }}</span>
              </Button>
            </form>
          </Transition>
        </CardContent>
      </Card>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border py-4 text-center text-xs text-muted-foreground">
      <p>&copy; 2026 Nahkoda AI · Business Copilot Merchant Platform</p>
    </footer>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.msg-slide-enter-active,
.msg-slide-leave-active {
  transition: all 0.25s ease;
}
.msg-slide-enter-from,
.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.3s ease;
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .msg-slide-enter-active,
  .msg-slide-leave-active,
  .step-slide-enter-active,
  .step-slide-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
