import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '../components/ui');

// Input
fs.writeFileSync(path.join(dir, 'input.vue'), `<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiInput' })

const modelValue = defineModel<string | number>()

const props = defineProps<{
  type?: string
  placeholder?: string
  class?: string
}>()
</script>

<template>
  <input
    v-model="modelValue"
    :type="type || 'text'"
    :placeholder="placeholder"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
`, 'utf8');

// Badge
fs.writeFileSync(path.join(dir, 'badge.vue'), `<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiBadge' })

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface Props {
  variant?: VariantProps<typeof badgeVariants>['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), props.class)">
    <slot />
  </div>
</template>
`, 'utf8');

// Label
fs.writeFileSync(path.join(dir, 'label.vue'), `<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiLabel' })

const props = defineProps<{
  for?: string
  class?: string
}>()
</script>

<template>
  <label
    :for="props.for"
    :class="
      cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class,
      )
    "
  >
    <slot />
  </label>
</template>
`, 'utf8');

// Select
fs.writeFileSync(path.join(dir, 'select.vue'), `<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiSelect' })

const modelValue = defineModel<string | number>()

const props = defineProps<{
  placeholder?: string
  class?: string
}>()
</script>

<template>
  <select
    v-model="modelValue"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <slot />
  </select>
</template>
`, 'utf8');

// Textarea
fs.writeFileSync(path.join(dir, 'textarea.vue'), `<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiTextarea' })

const modelValue = defineModel<string>()

const props = defineProps<{
  placeholder?: string
  rows?: number | string
  class?: string
}>()
</script>

<template>
  <textarea
    v-model="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :class="
      cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
`, 'utf8');

// Progress
fs.writeFileSync(path.join(dir, 'progress.vue'), `<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiProgress' })

const props = withDefaults(defineProps<{
  value?: number
  max?: number
  class?: string
}>(), {
  value: 0,
  max: 100,
})
</script>

<template>
  <div
    :class="cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary/20', props.class)"
  >
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ width: \`\${(props.value / props.max) * 100}%\` }"
    />
  </div>
</template>
`, 'utf8');

// DropdownMenuLabel
fs.writeFileSync(path.join(dir, 'dropdown-menu-label.vue'), `<script setup lang="ts">
import { cn } from '~/utils/cn'

defineOptions({ name: 'UiDropdownMenuLabel' })

const props = defineProps<{
  inset?: boolean
  class?: string
}>()
</script>

<template>
  <div
    :class="cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', props.class)"
  >
    <slot />
  </div>
</template>
`, 'utf8');

console.log('Successfully updated input, badge, label, select, textarea, progress, dropdown-menu-label props');
