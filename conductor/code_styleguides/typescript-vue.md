# TypeScript / Vue Style Guide

## TypeScript

### General
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` — use `unknown` or proper types
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` only when reassignment needed

### Naming
| Element | Convention | Example |
|---------|-----------|---------|
| Variables, functions | camelCase | `getPlayerStats`, `isAdmin` |
| Types, interfaces | PascalCase | `GamePlayer`, `RoleType` |
| Constants | UPPER_SNAKE_CASE | `MAX_PLAYERS`, `STORE_KEYS` |
| Files (components) | PascalCase | `RoleCard.vue`, `GameForm.vue` |
| Files (composables) | camelCase with `use` prefix | `useAuth.ts`, `useGames.ts` |
| Files (utils) | camelCase | `statsHelper.ts` |

### Functions
- Prefer arrow functions for callbacks and composable internals
- Use `function` declaration for exported/top-level functions
- Always type return values for public functions
- Max function length: ~30 lines (extract if longer)

### Imports
- Group imports: vue/nuxt → external libs → internal modules → types
- Use `type` imports: `import type { Role } from '~/types'`

## Vue / Nuxt

### Component Structure (SFC order)
```vue
<script setup lang="ts">
// 1. Imports
// 2. Props & emits
// 3. Composables
// 4. Reactive state
// 5. Computed
// 6. Methods
// 7. Watchers
// 8. Lifecycle hooks
</script>

<template>
  <!-- Single root element preferred -->
</template>

<style scoped>
/* Component-specific styles only */
</style>
```

### Props
- Always typed with `defineProps<T>()`
- Use `withDefaults()` for default values
- Props are readonly — never mutate

```ts
interface Props {
  role: Role
  showDescription?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
})
```

### Emits
- Always typed with `defineEmits<T>()`

```ts
const emit = defineEmits<{
  select: [role: Role]
  close: []
}>()
```

### Composables
- Always prefix with `use`
- Return reactive refs and functions
- Handle cleanup in `onUnmounted`
- All Nuxt composable calls (`useCookie`, `useState`, etc.) BEFORE first `await`

### Template
- Use `v-if` / `v-else` over `v-show` for conditional blocks
- Use `v-show` for frequent toggle (e.g., dropdown)
- Always use `:key` with `v-for`
- Prefer `<component :is>` over long `v-if` chains
- Max template nesting: 4 levels (extract sub-components if deeper)

### PrimeVue Usage
- Import components via module auto-import (no manual imports)
- Use PrimeVue composables: `useToast()`, `useConfirm()`
- Prefer `unstyled` mode with Tailwind classes over inline styles
- Use `pt` (pass-through) prop for deep customization

## ESLint Rules
```js
{
  'no-console': 'error',
  'semi': ['error', 'never'],
  'quotes': ['error', 'single'],
  'vue/max-len': ['warn', { code: 100 }],
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
}
```

## Formatting
- No semicolons
- Single quotes
- 2 space indentation
- Max line length: 100 characters
- Trailing comma: ES5

## File Organization
```
app/
  components/     # PascalCase Vue SFCs, organized by feature
  composables/    # useXxx.ts composables
  layouts/        # Nuxt layouts
  middleware/     # Route middleware
  pages/          # File-based routing
  types/          # TypeScript interfaces/types
  utils/          # Pure utility functions
```
