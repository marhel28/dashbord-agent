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
          <NuxtLink to="/register" class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Daftar Merchant</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main -->
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <Card class="w-full max-w-md animate-fade-in-up">
        <!-- Brand Header -->
        <CardHeader>
          <div class="flex items-center gap-3">
            <img src="/logo_lightmode.png" class="h-10 w-10 object-contain shrink-0" alt="Nahkoda Logo" />
            <div class="flex flex-col">
              <CardTitle class="text-base leading-tight text-card-foreground">Nahkoda AI</CardTitle>
              <CardDescription class="leading-tight">Business Copilot Merchant Platform</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <!-- Heading -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold tracking-tight text-foreground">Selamat datang kembali</h1>
            <p class="mt-1 text-sm text-muted-foreground">Masuk untuk mengelola toko dan laporan bisnis Anda</p>
          </div>

          <!-- Error banner -->
          <Transition name="error-slide">
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

          <!-- Form -->
          <form @submit.prevent="handleLogin" novalidate class="space-y-4">
            <!-- Email -->
            <div class="space-y-2">
              <Label for="login-email">Email</Label>
              <div class="relative">
                <Icon name="heroicons:envelope" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="login-email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="nama@toko.com"
                  class="pl-9"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="login-password">Kata Sandi</Label>
                <NuxtLink to="/forgot-password" class="text-xs font-medium text-primary hover:text-primary/80 transition-colors" tabindex="0">
                  Lupa password?
                </NuxtLink>
              </div>
              <div class="relative">
                <Icon name="heroicons:lock-closed" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
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
            </div>

            <!-- Submit -->
            <Button
              type="submit"
              :disabled="loading || !email || !password"
              class="w-full"
              id="btn-login-submit"
            >
              <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>
              <Icon v-else name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" aria-hidden="true" />
              <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Beranda' }}</span>
            </Button>
          </form>

          <!-- Divider -->
          <div class="relative my-6" aria-hidden="true">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="bg-card px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          <!-- Register prompt -->
          <p class="text-center text-sm text-muted-foreground">
            Belum punya akun?
            <NuxtLink to="/register" class="font-semibold text-primary hover:text-primary/80 transition-colors">Daftar sekarang</NuxtLink>
          </p>
        </CardContent>

        <!-- Security badge -->
        <CardFooter class="justify-center border-t border-border pt-4">
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="heroicons:lock-closed-solid" class="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Koneksi terenkripsi SSL/TLS</span>
          </div>
        </CardFooter>
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

.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.25s ease;
}
.error-slide-enter-from,
.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
