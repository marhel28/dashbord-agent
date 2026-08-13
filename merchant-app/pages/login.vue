<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const { login } = useAuth()

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
    navigateTo('/dashboard')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Email atau password salah.'
    errorMsg.value = message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-root">
    <!-- Navigation Header Navbar -->
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
          <NuxtLink to="/register" class="nav-item">Daftar Merchant</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="auth-main">
      <div class="auth-card animate-fade-in-up">
        <!-- Brand Card Header -->
        <div class="brand-block">
          <img src="/logo_lightmode.png" class="w-10 h-10 object-contain shrink-0" alt="Nahkoda Logo" />
          <div class="brand-text">
            <span class="brand-name">Nahkoda AI</span>
            <span class="brand-sub">Business Copilot Merchant Platform</span>
          </div>
        </div>

        <!-- Heading -->
        <div class="heading-block">
          <h1 class="heading-title">Selamat datang kembali</h1>
          <p class="heading-desc">Masuk untuk mengelola toko dan laporan bisnis Anda</p>
        </div>

        <!-- Error banner -->
        <Transition name="error-slide">
          <div v-if="errorMsg" class="error-banner" role="alert" aria-live="polite">
            <Icon name="heroicons:exclamation-circle-solid" class="icon-error" />
            <span>{{ errorMsg }}</span>
          </div>
        </Transition>

        <!-- Form -->
        <form @submit.prevent="handleLogin" novalidate class="login-form">
          <!-- Email -->
          <div class="field-group">
            <label for="login-email" class="field-label">Email</label>
            <div class="field-input-wrap">
              <Icon name="heroicons:envelope" class="field-icon" aria-hidden="true" />
              <input
                id="login-email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="nama@toko.com"
                class="field-input"
                :class="{ 'field-input--error': errorMsg }"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field-group">
            <div class="field-label-row">
              <label for="login-password" class="field-label">Kata Sandi</label>
              <NuxtLink to="/forgot-password" class="forgot-link" tabindex="0">
                Lupa password?
              </NuxtLink>
            </div>
            <div class="field-input-wrap">
              <Icon name="heroicons:lock-closed" class="field-icon" aria-hidden="true" />
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                class="field-input field-input--pw"
                :class="{ 'field-input--error': errorMsg }"
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
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !email || !password"
            class="btn-submit"
            :class="{ 'btn-submit--loading': loading }"
            id="btn-login-submit"
          >
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            <Icon v-else name="heroicons:arrow-right-on-rectangle" class="icon-submit" aria-hidden="true" />
            <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Beranda' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider" aria-hidden="true">
          <div class="divider-line"></div>
          <span class="divider-text">atau</span>
          <div class="divider-line"></div>
        </div>

        <!-- Register link -->
        <p class="register-prompt">
          Belum punya akun?
          <NuxtLink to="/register" class="register-link">Daftar sekarang</NuxtLink>
        </p>

        <!-- Security badge -->
        <div class="security-badge" aria-label="Koneksi aman terenkripsi">
          <Icon name="heroicons:lock-closed-solid" class="icon-security" aria-hidden="true" />
          <span>Koneksi terenkripsi SSL/TLS</span>
        </div>
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
  max-width: 440px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px -5px rgba(15, 26, 46, 0.08), 0 0 1px rgba(0, 0, 0, 0.05);
}

/* ── Brand Card Header ── */
.brand-block {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1.75rem;
}
.brand-name {
  display: block;
  font-size: 1.125rem;
  font-weight: 800;
  color: #0F1A2E;
  line-height: 1.2;
}
.brand-sub {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748B;
  margin-top: 2px;
}

/* ── Heading ── */
.heading-block { margin-bottom: 1.75rem; }
.heading-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0F1A2E;
  letter-spacing: -0.02em;
  margin: 0 0 0.375rem;
  line-height: 1.2;
}
.heading-desc {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
}

/* ── Error banner ── */
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}
.icon-error { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }

/* ── Form ── */
.login-form { display: flex; flex-direction: column; gap: 1.125rem; }
.field-group { display: flex; flex-direction: column; gap: 0.5rem; }
.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.forgot-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: #B8922E;
  text-decoration: none;
  transition: color 0.15s;
}
.forgot-link:hover { color: #8C6D1F; }
.field-input-wrap { position: relative; }
.field-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px; height: 18px;
  color: #94A3B8;
  pointer-events: none;
}
.field-input {
  width: 100%;
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  color: #0F1A2E;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  box-sizing: border-box;
}
.field-input::placeholder { color: #94A3B8; }
.field-input:focus {
  border-color: #B8922E;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(184,146,46,0.15);
}
.field-input--pw { padding-right: 2.75rem; }
.field-input--error {
  border-color: #EF4444;
}

.toggle-pw {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  color: #94A3B8;
  cursor: pointer;
  display: flex; align-items: center;
}
.toggle-pw:hover { color: #475569; }
.icon-toggle { width: 18px; height: 18px; }

/* ── Submit button ── */
.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 11px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  background: linear-gradient(135deg, #D4A843 0%, #B8922E 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(184,146,46,0.3);
  margin-top: 0.375rem;
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(184,146,46,0.4);
}
.btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.icon-submit { width: 18px; height: 18px; }

/* ── Divider ── */
.divider {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin: 1.5rem 0 1.25rem;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: #E2E8F0;
}
.divider-text {
  font-size: 0.75rem;
  color: #94A3B8;
  white-space: nowrap;
  font-weight: 500;
}

/* ── Register prompt ── */
.register-prompt {
  text-align: center;
  font-size: 0.875rem;
  color: #64748B;
  margin: 0 0 1.25rem;
}
.register-link {
  color: #B8922E;
  font-weight: 700;
  text-decoration: none;
  margin-left: 0.25rem;
}
.register-link:hover { color: #8C6D1F; }

/* ── Security badge ── */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #64748B;
  font-weight: 500;
  border-top: 1px solid #F1F5F9;
  padding-top: 1.25rem;
}
.icon-security { width: 14px; height: 14px; color: #B8922E; }

/* ── Footer ── */
.auth-footer {
  border-top: 1px solid #F1F5F9;
  padding: 1.25rem;
  text-align: center;
  color: #94A3B8;
  font-size: 0.75rem;
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

