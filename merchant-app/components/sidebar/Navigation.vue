<script setup>
const menuItems = [
  { to: '/', icon: 'heroicons:rectangle-group', label: 'Dashboard' },
  { to: '/agents', icon: 'heroicons:sparkles', label: 'AI Agents' },
  { to: '/tambah-skill', icon: 'heroicons:plus-circle', label: 'Tambah Skill' },
  { to: '/inventory', icon: 'heroicons:archive-box', label: 'Inventory' },
  { to: '/sales-report', icon: 'heroicons:chart-bar', label: 'Sales Reports' },
]
</script>

<template>
  <nav class="space-y-1">
    <NuxtLink
      v-for="item in menuItems"
      :key="item.to"
      :to="item.to"
      exact-active-class="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
      class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon :name="item.icon" class="size-5 shrink-0" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>
