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
const colorMode = useColorMode()

const logoSrc = computed(() => {
  return colorMode.value === 'dark' ? '/logo_darkmode.png' : '/logo_lightmode.png'
})

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
    navigateTo('/')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Email atau kata sandi tidak valid.'
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
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Admin Copilot</span>
          </div>
        </NuxtLink>

        <!-- Quick Theme Switcher -->
        <div class="flex items-center gap-3">
          <button 
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'" 
            class="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
            :title="colorMode.value === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'"
          >
            <Icon v-if="colorMode.value === 'dark'" name="lucide:sun" class="w-4 h-4 text-amber-400" />
            <Icon v-else name="lucide:moon" class="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <Card class="w-full max-w-md animate-fade-in-up border-slate-200/80 dark:border-slate-700/60 shadow-md">
        <!-- Brand Header -->
        <CardHeader class="pb-4">
          <div class="flex items-center gap-3">
            <img :src="logoSrc" class="h-10 w-10 object-contain shrink-0" alt="Nahkoda Logo" />
            <div class="flex flex-col">
              <CardTitle class="text-base leading-tight text-card-foreground">Nahkoda AI</CardTitle>
              <CardDescription class="text-xs leading-tight">Admin & Ecosystem Management Portal</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-5">
          <!-- Heading -->
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground">Masuk ke Command Center</h1>
            <p class="mt-1 text-xs text-muted-foreground">Otentikasi kredensial administrator Anda</p>
          </div>

          <!-- Error banner -->
          <div
            v-if="errorMsg"
            class="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2"
          >
            <Icon name="lucide:alert-circle" class="h-4 w-4 shrink-0 mt-0.5" />
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Email -->
            <div class="space-y-1.5">
              <Label for="login-email" class="text-xs font-bold text-slate-700 dark:text-slate-300">Email Administrator</Label>
              <div class="relative">
                <Icon name="lucide:mail" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="admin@nahkoda.id"
                  class="pl-9 text-xs"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <Label for="login-password" class="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi</Label>
              </div>
              <div class="relative">
                <Icon name="lucide:lock" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                  class="pl-9 pr-10 text-xs"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  :title="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                >
                  <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Submit -->
            <Button
              type="submit"
              :disabled="loading"
              class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg h-10 shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <Icon v-if="loading" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
              <span>{{ loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Dashboard' }}</span>
            </Button>
          </form>
        </CardContent>

        <CardFooter class="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between text-xs text-muted-foreground">
          <span>Nahkoda Enterprise Platform</span>
          <span class="font-mono text-[10px]">v2.4.0</span>
        </CardFooter>
      </Card>
    </main>
  </div>
</template>
