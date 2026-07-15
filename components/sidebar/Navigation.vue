<template>
  <nav class="space-y-1.5">
    <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to"
      exact-active-class="nav-link nav-active" class="nav-link">
      <Icon :name="item.icon" class="w-5 h-5" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup>
const menuItems = [
  { to: '/', icon: 'heroicons:rectangle-group', label: 'Dashboard' },
  { to: '/agents', icon: 'heroicons:sparkles', label: 'AI Agents' },
  { to: '/tambah-skill', icon: 'heroicons:plus-circle', label: 'Tambah Skill' },
  { to: '/inventory', icon: 'heroicons:archive-box', label: 'Inventory' },
  { to: '/sales-report', icon: 'heroicons:chart-bar', label: 'Sales Reports' },
]
</script>
