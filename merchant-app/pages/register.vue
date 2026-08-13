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
  <div class="auth-root">
    <!-- Top Navigation Navbar -->
    <header class="auth-nav">
      <div class="nav-container">
        <NuxtLink to="/" class="brand-block-nav">
          <img src="/logo_lightmode.png" class="w-8 h-8 object-contain shrink-0" alt="Nahkoda Logo" />
          <div class="brand-text-nav">
            <span class="brand-name-nav">Nahkoda</span>
            <span class="brand-tag-nav">Business Copilot</span>
          </div>
        </NuxtLink>

        <nav class="nav-links">
          <NuxtLink to="/" class="nav-item">Beranda</NuxtLink>
          <NuxtLink to="/login" class="nav-item">Masuk Merchant</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="auth-main">
      <div class="auth-card animate-fade-in-up">
        <!-- Brand Header -->
        <div class="brand-block">
          <img src="/logo_lightmode.png" class="w-10 h-10 object-contain shrink-0" alt="Nahkoda AI Logo" />
          <div class="brand-text">
            <span class="brand-name">Nahkoda AI</span>
            <span class="brand-sub">Business Copilot Merchant Platform</span>
          </div>
        </div>

        <!-- Step indicator -->
        <div class="steps-indicator" aria-label="Progress pendaftaran">
          <div
            v-for="s in totalSteps"
            :key="s"
            class="step-item"
            :class="{
              'step-item--done': s < currentStep || registered,
              'step-item--active': s === currentStep && !registered
            }"
          >
            <div class="step-dot">
              <Icon v-if="s < currentStep || registered" name="heroicons:check-solid" class="step-check" />
              <span v-else class="step-num">{{ s }}</span>
            </div>
            <span class="step-label">{{ s === 1 ? 'Data Akun' : 'Info Toko' }}</span>
          </div>
          <div class="step-connector" :class="{ 'step-connector--done': currentStep > 1 || registered }"></div>
        </div>

        <!-- Messages -->
        <Transition name="msg-slide">
          <div v-if="errorMsg" class="error-banner" role="alert" aria-live="polite">
            <Icon name="heroicons:exclamation-circle-solid" class="icon-msg" />
            <span>{{ errorMsg }}</span>
          </div>
        </Transition>

        <!-- ── SUCCESS STATE ── -->
        <Transition name="msg-slide">
          <div v-if="registered" class="success-state">
            <div class="success-icon-wrap">
              <div class="success-ring"></div>
              <Icon name="heroicons:check-circle-solid" class="icon-success-big" />
            </div>
            <h2 class="success-title">Akun Berhasil Dibuat!</h2>
            <p class="success-desc">Selamat bergabung di Nahkoda AI. Silakan masuk dengan akun Anda.</p>
            <NuxtLink to="/login" class="btn-goto-login" id="btn-goto-login">
              <Icon name="heroicons:arrow-right-on-rectangle" class="icon-btn" />
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
            class="reg-form"
            key="step1"
          >
            <h2 class="form-section-title">Informasi Akun</h2>

            <!-- Role Badge (Pedagang Only) -->
            <div class="field-group">
              <span class="field-label">Peran Akun</span>
              <div class="role-card role-card--active" style="cursor: default;">
                <Icon name="heroicons:building-storefront-solid" class="icon-role" />
                <div class="flex-1">
                  <span class="role-name">Pedagang / Penjual</span>
                  <span class="role-desc">Pendaftaran akun khusus Pemilik Toko & Pedagang</span>
                </div>
                <Icon name="heroicons:check-circle-solid" class="role-check" />
              </div>
            </div>

            <!-- Name -->
            <div class="field-group">
              <label for="reg-name" class="field-label">
                Nama Lengkap <span class="required">*</span>
              </label>
              <div class="field-input-wrap">
                <Icon name="heroicons:user" class="field-icon" aria-hidden="true" />
                <input
                  id="reg-name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="field-group">
              <label for="reg-email" class="field-label">
                Email Toko / Pemilik <span class="required">*</span>
              </label>
              <div class="field-input-wrap">
                <Icon name="heroicons:envelope" class="field-icon" aria-hidden="true" />
                <input
                  id="reg-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="budi@warungmakmur.com"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Phone Number -->
            <div class="field-group">
              <label for="reg-phone" class="field-label">
                Nomor Telepon / WA <span class="required">*</span>
              </label>
              <div class="field-input-wrap">
                <Icon name="heroicons:phone" class="field-icon" aria-hidden="true" />
                <input
                  id="reg-phone"
                  v-model="form.phone_number"
                  type="tel"
                  autocomplete="tel"
                  required
                  placeholder="081234567890"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="field-group">
              <label for="reg-password" class="field-label">
                Kata Sandi <span class="required">*</span>
              </label>
              <div class="field-input-wrap">
                <Icon name="heroicons:lock-closed" class="field-icon" aria-hidden="true" />
                <input
                  id="reg-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  placeholder="Minimal 8 karakter"
                  class="field-input field-input--pw"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="toggle-pw"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                >
                  <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="icon-toggle" />
                </button>
              </div>

              <!-- Password strength bar -->
              <div v-if="form.password" class="pw-strength">
                <div class="pw-bars">
                  <div
                    v-for="b in 3"
                    :key="b"
                    class="pw-bar"
                    :class="{
                      'pw-bar--fill':
                        (b === 1 && form.password.length >= 4) ||
                        (b === 2 && form.password.length >= 8) ||
                        (b === 3 && form.password.length >= 12 && /[A-Z]/.test(form.password))
                    }"
                  ></div>
                </div>
                <span class="pw-hint">
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
            <button
              type="submit"
              :disabled="!step1Valid"
              class="btn-next"
              id="btn-reg-next"
            >
              <span>Lanjut: Informasi Toko</span>
              <Icon name="heroicons:arrow-right" class="icon-submit" />
            </button>

            <p class="login-prompt">
              Sudah punya akun?
              <NuxtLink to="/login" class="login-link">Masuk di sini</NuxtLink>
            </p>
          </form>
        </Transition>

        <!-- ── STEP 2: Informasi Toko ── -->
        <Transition name="step-slide">
          <form
            v-if="!registered && currentStep === 2"
            @submit.prevent="handleRegister"
            novalidate
            class="reg-form"
            key="step2"
          >
            <div class="form-section-header">
              <button type="button" @click="prevStep" class="btn-back" aria-label="Kembali ke langkah 1">
                <Icon name="heroicons:arrow-left" class="icon-back" />
              </button>
              <h2 class="form-section-title">Informasi Toko / Usaha</h2>
            </div>

            <!-- Store Name -->
            <div class="field-group">
              <label for="reg-store-name" class="field-label">
                Nama Toko / Usaha <span class="required">*</span>
              </label>
              <div class="field-input-wrap">
                <Icon name="heroicons:building-storefront" class="field-icon" aria-hidden="true" />
                <input
                  id="reg-store-name"
                  v-model="form.store_name"
                  type="text"
                  required
                  placeholder="Warung Sembako Makmur"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Store Type & Category row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="field-group">
                <label for="reg-store-type" class="field-label">Tipe Usaha</label>
                <select id="reg-store-type" v-model="form.store_type" class="field-input field-input--sm">
                  <option v-for="t in storeTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>

              <div class="field-group">
                <label for="reg-category" class="field-label">Kategori Produk</label>
                <select id="reg-category" v-model="form.category_store" class="field-input field-input--sm">
                  <option v-for="c in storeCategories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <!-- Address -->
            <div class="field-group">
              <label for="reg-address" class="field-label">
                Alamat Toko <span class="required">*</span>
              </label>
              <textarea
                id="reg-address"
                v-model="form.address"
                rows="2"
                required
                placeholder="Jl. Merdeka No. 12, Kel. Menteng, Jakarta Pusat"
                class="field-textarea"
              ></textarea>
            </div>

            <!-- Location Coordinates (GPS) -->
            <div class="field-group">
              <div class="field-label-row">
                <span class="field-label">Koordinat Lokasi (GPS) <span class="optional">(opsional)</span></span>
                <button
                  type="button"
                  @click="detectLocation"
                  :disabled="detecting"
                  class="btn-locate"
                >
                  <Icon :name="detecting ? 'heroicons:arrow-path' : 'heroicons:map-pin'" class="icon-locate" :class="{ 'animate-spin': detecting }" />
                  <span>{{ detecting ? 'Mendeteksi...' : 'Deteksi Lokasi Saya' }}</span>
                </button>
              </div>
              <div class="gps-inputs">
                <input
                  v-model.number="form.latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude (-6.2000)"
                  class="field-input field-input--sm"
                />
                <input
                  v-model.number="form.longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude (106.8166)"
                  class="field-input field-input--sm"
                />
              </div>
            </div>

            <!-- Description (Optional) -->
            <div class="field-group">
              <label for="reg-desc" class="field-label">
                Deskripsi Toko <span class="optional">(opsional)</span>
              </label>
              <input
                id="reg-desc"
                v-model="form.description"
                type="text"
                placeholder="Menjual sembako murah, beras, minyak goreng..."
                class="field-input field-input--sm"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || !step2Valid"
              class="btn-submit"
              id="btn-reg-submit"
            >
              <span v-if="loading" class="spinner" aria-hidden="true"></span>
              <Icon v-else name="heroicons:check-circle" class="icon-submit" aria-hidden="true" />
              <span>{{ loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Merchant' }}</span>
            </button>
          </form>
        </Transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <p>© 2026 Nahkoda AI · Business Copilot Merchant Platform</p>
    </footer>
  </div>
</template>

<style scoped>
/* ── Root Clean White Theme ── */
.auth-root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  color: #0F1A2E;
  font-family: 'Inter', 'Fira Sans', system-ui, sans-serif;
}

/* ── Top Navbar ── */
.auth-nav {
  width: 100%;
  border-bottom: 1px solid #E2E8F0;
  background: #FFFFFF;
  padding: 1rem 0;
}
.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand-block-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}
.brand-text-nav {
  display: flex;
  flex-direction: column;
}
.brand-name-nav {
  font-weight: 800;
  font-size: 1.125rem;
  color: #0F1A2E;
  line-height: 1;
}
.brand-tag-nav {
  font-size: 0.7rem;
  color: #B8922E;
  font-weight: 600;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-item {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: color 0.15s;
}
.nav-item:hover {
  color: #B8922E;
}

/* ── Main Layout ── */
.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

/* ── Card White Style ── */
.auth-card {
  width: 100%;
  max-width: 500px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 2.25rem 2rem;
  box-shadow: 0 10px 30px -5px rgba(15, 26, 46, 0.08), 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* ── Brand Card Header ── */
.brand-block {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}
.brand-name { display: block; font-size: 1.125rem; font-weight: 800; color: #0F1A2E; line-height: 1.2; }
.brand-sub  { display: block; font-size: 0.75rem; font-weight: 500; color: #64748B; margin-top: 2px; }

/* ── Steps ── */
.steps-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 1.5rem;
  position: relative;
}
.step-connector {
  flex: 1;
  height: 2px;
  background: #E2E8F0;
  margin: 0 0.75rem;
  border-radius: 1px;
  transition: background 0.3s;
  position: relative;
  top: -10px;
}
.step-connector--done { background: #B8922E; }
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.step-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 2px solid #CBD5E1;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748B;
  background: #F8FAFC;
  transition: all 0.25s;
}
.step-item--active .step-dot {
  border-color: #B8922E;
  color: #B8922E;
  background: rgba(184,146,46,0.1);
}
.step-item--done .step-dot {
  border-color: #B8922E;
  background: #B8922E;
  color: #FFFFFF;
}
.step-check { width: 14px; height: 14px; }
.step-num { font-size: 0.75rem; font-weight: 700; }
.step-label { font-size: 0.7rem; font-weight: 600; color: #64748B; text-align: center; white-space: nowrap; }
.step-item--active .step-label { color: #B8922E; font-weight: 700; }
.step-item--done .step-label { color: #0F1A2E; }

/* ── Messages ── */
.error-banner {
  display: flex; align-items: flex-start; gap: 0.625rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}
.icon-msg { width: 17px; height: 17px; flex-shrink: 0; margin-top: 1px; }

/* ── Form & Fields ── */
.reg-form { display: flex; flex-direction: column; gap: 1rem; }
.form-section-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0F1A2E;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}
.form-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0;
}
.btn-back {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 0.5rem;
  color: #475569;
  cursor: pointer;
  display: flex; align-items: center;
}
.btn-back:hover { border-color: #B8922E; color: #B8922E; }
.icon-back { width: 16px; height: 16px; }

.field-group { display: flex; flex-direction: column; gap: 0.4375rem; }
.field-label { font-size: 0.75rem; font-weight: 700; color: #475569; letter-spacing: 0.04em; text-transform: uppercase; }
.required { color: #DC2626; margin-left: 2px; }
.optional { color: #94A3B8; font-size: 0.7rem; font-weight: 400; text-transform: none; }
.field-label-row { display: flex; justify-content: space-between; align-items: center; }
.field-input-wrap { position: relative; }
.field-icon {
  position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
  width: 17px; height: 17px; color: #94A3B8; pointer-events: none;
}
.field-input {
  width: 100%;
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  border-radius: 9px;
  padding: 0.7rem 1rem 0.7rem 2.625rem;
  color: #0F1A2E;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.field-input::placeholder { color: #94A3B8; }
.field-input:focus {
  border-color: #B8922E;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(184,146,46,0.15);
}
.field-input--pw { padding-right: 2.625rem; }
.field-input--sm { padding-left: 1rem; font-size: 0.85rem; }
.field-textarea {
  width: 100%;
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  border-radius: 9px;
  padding: 0.7rem 1rem;
  color: #0F1A2E;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  resize: none;
  box-sizing: border-box;
}
.field-textarea::placeholder { color: #94A3B8; }
.field-textarea:focus {
  border-color: #B8922E;
  box-shadow: 0 0 0 3px rgba(184,146,46,0.15);
}
.toggle-pw {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; padding: 0.25rem; color: #94A3B8;
  cursor: pointer; display: flex; align-items: center;
}
.toggle-pw:hover { color: #475569; }
.icon-toggle { width: 16px; height: 16px; }

/* ── Role card ── */
.role-card {
  position: relative;
  display: flex; align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
}
.role-card--active {
  border-color: #B8922E;
  background: rgba(184,146,46,0.06);
}
.icon-role { width: 22px; height: 22px; color: #B8922E; flex-shrink: 0; }
.role-name { font-size: 0.875rem; font-weight: 700; color: #0F1A2E; display: block; }
.role-desc  { font-size: 0.72rem; color: #64748B; display: block; }
.role-check { width: 18px; height: 18px; color: #B8922E; flex-shrink: 0; }

/* ── GPS inputs ── */
.gps-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.btn-locate {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.3rem 0.75rem;
  border-radius: 7px;
  border: 1px solid #B8922E;
  background: rgba(184,146,46,0.08);
  color: #B8922E;
  font-size: 0.72rem; font-weight: 700;
  cursor: pointer;
}
.btn-locate:hover:not(:disabled) { background: rgba(184,146,46,0.15); }
.icon-locate { width: 13px; height: 13px; }

/* ── Buttons ── */
.btn-next, .btn-submit {
  display: flex; align-items: center; justify-content: center; gap: 0.625rem;
  width: 100%;
  padding: 0.825rem 1.5rem;
  border: none; border-radius: 10px;
  font-size: 0.875rem; font-weight: 700; font-family: inherit;
  cursor: pointer; transition: all 0.15s;
  background: linear-gradient(135deg, #D4A843 0%, #B8922E 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(184,146,46,0.3);
  margin-top: 0.25rem;
}
.btn-next:disabled, .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-next:not(:disabled):hover, .btn-submit:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(184,146,46,0.4); }

.icon-submit { width: 17px; height: 17px; }

/* ── Login prompt ── */
.login-prompt { text-align: center; font-size: 0.875rem; color: #64748B; margin: 1.25rem 0 0; }
.login-link { color: #B8922E; font-weight: 700; text-decoration: none; margin-left: 0.25rem; }
.login-link:hover { color: #8C6D1F; }

/* ── Footer ── */
.auth-footer {
  border-top: 1px solid #F1F5F9;
  padding: 1.25rem;
  text-align: center;
  color: #94A3B8;
  font-size: 0.75rem;
}

.animate-fade-in-up { animation: fadeInUp 0.4s ease-out both; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up { animation: none; }
  .btn-next, .btn-submit, .field-input { transition: none; }
}
</style>
