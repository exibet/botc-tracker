# Blood on the Clocktower Community Tracker -- UI/UX Design System

> Implementation guide for Nuxt 4 + PrimeVue 4 (Aura) + Tailwind CSS 4
> Target: Dark-themed, mysterious, blood-red accented interface
> Bilingual: Ukrainian + English (role names shown as "Емпат (Empath)")

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Layout System](#2-layout-system)
3. [Page Specifications](#3-page-specifications)
4. [Role Type Color Coding](#4-role-type-color-coding)
5. [Dark Mode Implementation](#5-dark-mode-implementation)
6. [Animations and Transitions](#6-animations-and-transitions)
7. [Mobile-First Responsive](#7-mobile-first-responsive)
8. [Authorization UI Patterns](#8-authorization-ui-patterns)

---

## 1. Design System

### 1.1 Color Palette

The BotC theme draws from the game's atmosphere: dark nights, blood tokens, candlelight, and the village square. The palette is intentionally dark with blood-red as the primary accent.

#### Primitive Tokens (raw color values)

```css
/* assets/css/main.css */
@import "tailwindcss";

:root {
  /* Blood Red scale -- primary */
  --botc-red-50: oklch(0.971 0.013 17.38);
  --botc-red-100: oklch(0.936 0.032 17.717);
  --botc-red-200: oklch(0.885 0.062 18.334);
  --botc-red-300: oklch(0.808 0.114 19.571);
  --botc-red-400: oklch(0.704 0.191 22.216);
  --botc-red-500: oklch(0.637 0.237 25.331);  /* Primary */
  --botc-red-600: oklch(0.577 0.245 27.325);
  --botc-red-700: oklch(0.505 0.213 27.518);
  --botc-red-800: oklch(0.444 0.177 26.899);
  --botc-red-900: oklch(0.396 0.141 25.723);
  --botc-red-950: oklch(0.258 0.092 26.042);

  /* Night Sky surface scale */
  --botc-night-0: oklch(1.0 0.0 0);
  --botc-night-50: oklch(0.965 0.004 264.542);
  --botc-night-100: oklch(0.928 0.006 264.531);
  --botc-night-200: oklch(0.87 0.012 264.531);
  --botc-night-300: oklch(0.77 0.022 264.531);
  --botc-night-400: oklch(0.63 0.03 264.531);
  --botc-night-500: oklch(0.51 0.026 264.531);
  --botc-night-600: oklch(0.44 0.022 264.531);
  --botc-night-700: oklch(0.37 0.018 264.531);
  --botc-night-800: oklch(0.27 0.014 264.531);
  --botc-night-900: oklch(0.21 0.034 264.665);
  --botc-night-950: oklch(0.145 0.028 269.61);

  /* Accent: Candlelight Gold */
  --botc-gold-400: oklch(0.828 0.12 81.2);
  --botc-gold-500: oklch(0.769 0.145 70.08);
  --botc-gold-600: oklch(0.666 0.16 52.98);

  /* Role type colors (defined here, used in semantic tokens) */
  --botc-townsfolk: oklch(0.623 0.214 259.815);   /* Blue */
  --botc-outsider: oklch(0.637 0.16 195.956);      /* Teal/Cyan */
  --botc-minion: oklch(0.702 0.183 54.116);         /* Orange */
  --botc-demon: oklch(0.637 0.237 25.331);          /* Blood Red */
  --botc-traveller: oklch(0.627 0.192 292.788);     /* Purple */
  --botc-fabled: oklch(0.769 0.145 70.08);          /* Gold */
}

/* Tailwind v4 theme tokens */
@theme inline {
  --color-primary: var(--botc-red-500);
  --color-primary-hover: var(--botc-red-400);
  --color-primary-active: var(--botc-red-600);

  --color-surface: var(--botc-night-900);
  --color-surface-card: var(--botc-night-800);
  --color-surface-overlay: var(--botc-night-950);
  --color-surface-hover: var(--botc-night-700);
  --color-surface-border: var(--botc-night-600);
  --color-surface-ground: var(--botc-night-950);

  --color-accent: var(--botc-gold-500);
  --color-accent-hover: var(--botc-gold-400);

  --color-text: var(--botc-night-50);
  --color-text-muted: var(--botc-night-400);
  --color-text-subtle: var(--botc-night-500);

  --color-townsfolk: var(--botc-townsfolk);
  --color-outsider: var(--botc-outsider);
  --color-minion: var(--botc-minion);
  --color-demon: var(--botc-demon);
  --color-traveller: var(--botc-traveller);
  --color-fabled: var(--botc-fabled);

  --color-good: oklch(0.723 0.219 149.579);   /* Emerald green */
  --color-evil: var(--botc-red-500);
  --color-dead: var(--botc-night-500);

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

#### Quick Reference Table

| Token            | Hex Approx | Usage                             |
|------------------|------------|-----------------------------------|
| `primary`        | `#C0392B`  | CTAs, active states, blood accent |
| `surface`        | `#1a1a2e`  | Page background                   |
| `surface-card`   | `#242438`  | Card backgrounds                  |
| `surface-overlay`| `#111122`  | Modals, dropdowns                 |
| `accent`         | `#D4A017`  | Gold highlights, fabled, MVP      |
| `text`           | `#F0F0F5`  | Primary text                      |
| `text-muted`     | `#8888A0`  | Secondary text                    |
| `good`           | `#10B981`  | Good team indicator               |
| `evil`           | `#C0392B`  | Evil team indicator               |

### 1.2 Typography

Use system fonts with a gothic/serif accent for headings to evoke the BotC atmosphere.

```css
:root {
  --font-heading: 'Cinzel', 'Georgia', serif;
  --font-body: 'Inter', 'system-ui', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

@theme inline {
  --font-family-heading: var(--font-heading);
  --font-family-body: var(--font-body);
  --font-family-mono: var(--font-mono);
}
```

**Type Scale (mobile-first, rem-based):**

| Name     | Size     | Line Height | Weight   | Usage                     |
|----------|----------|-------------|----------|---------------------------|
| Display  | 2.25rem  | 2.5rem      | 700      | Hero headlines            |
| H1       | 1.875rem | 2.25rem     | 700      | Page titles               |
| H2       | 1.5rem   | 2rem        | 600      | Section headers           |
| H3       | 1.25rem  | 1.75rem     | 600      | Card titles               |
| Body     | 1rem     | 1.5rem      | 400      | Default text              |
| Small    | 0.875rem | 1.25rem     | 400      | Secondary text, captions  |
| Tiny     | 0.75rem  | 1rem        | 500      | Badges, labels, metadata  |

**Heading elements** use `font-heading`, **body** uses `font-body`.

### 1.3 Spacing

Follow an 8px grid. Tailwind v4 default spacing applies.

| Token | Value  | Usage                        |
|-------|--------|------------------------------|
| `1`   | 4px    | Tight inline spacing         |
| `2`   | 8px    | Default small gaps           |
| `3`   | 12px   | Input padding                |
| `4`   | 16px   | Card internal padding        |
| `5`   | 20px   | Card padding (desktop)       |
| `6`   | 24px   | Section spacing              |
| `8`   | 32px   | Large section gaps           |
| `12`  | 48px   | Hero sections                |
| `16`  | 64px   | Page-level vertical rhythm   |

### 1.4 Elevation / Shadows

```css
:root {
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-overlay: 0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-glow-red: 0 0 20px rgba(192, 57, 43, 0.3);
  --shadow-glow-gold: 0 0 20px rgba(212, 160, 23, 0.3);
}
```

### 1.5 Border Radius

| Token        | Value    | Usage                      |
|--------------|----------|----------------------------|
| `radius-sm`  | 6px      | Buttons, inputs, tags      |
| `radius-md`  | 8px      | Cards, dropdowns           |
| `radius-lg`  | 12px     | Modals, large cards        |
| `radius-xl`  | 16px     | Hero cards, featured items |
| `rounded-full` | 9999px | Avatars, badges            |

---

## 2. Layout System

### 2.1 Responsive Breakpoints

Use Tailwind v4 defaults:

| Breakpoint | Width  | Target           |
|------------|--------|------------------|
| `sm`       | 640px  | Large phones     |
| `md`       | 768px  | Tablets          |
| `lg`       | 1024px | Small desktops   |
| `xl`       | 1280px | Desktops         |
| `2xl`      | 1536px | Large screens    |

### 2.2 Page Shell Layout

```
+--------------------------------------------------+
|  Header (Menubar)                          h=64px |
+--------------------------------------------------+
|                                                    |
|   Main Content Area (max-w-7xl mx-auto px-4)     |
|                                                    |
+--------------------------------------------------+
|  Footer                                           |
+--------------------------------------------------+
```

**No sidebar.** This is a community tool, not a casino. Keep it simple with a top navigation bar and full-width content area.

#### Header Component

```vue
<!-- components/AppHeader.vue -->
<template>
  <Menubar :model="menuItems" class="sticky top-0 z-50 border-b border-surface-border">
    <template #start>
      <NuxtLink to="/" class="flex items-center gap-2">
        <img src="/images/logo.svg" alt="BotC Tracker" class="h-8 w-8" />
        <span class="font-heading text-lg font-bold text-primary hidden sm:inline">
          BotC Tracker
        </span>
      </NuxtLink>
    </template>
    <template #end>
      <div class="flex items-center gap-2">
        <Button
          v-if="!isAuthenticated"
          label="Sign In"
          icon="pi pi-sign-in"
          severity="contrast"
          text
        />
        <Avatar
          v-else
          :label="userInitials"
          shape="circle"
          class="cursor-pointer"
          @click="toggleUserMenu"
        />
      </div>
    </template>
  </Menubar>
</template>
```

**PrimeVue Components:** `Menubar`, `Button`, `Avatar`, `Menu` (for user dropdown)

**Menu Items:**
```ts
const menuItems = [
  { label: 'Home', icon: 'pi pi-home', route: '/' },
  { label: 'Games', icon: 'pi pi-list', route: '/games' },
  { label: 'Players', icon: 'pi pi-users', route: '/players' },
  { label: 'Leaderboard', icon: 'pi pi-trophy', route: '/leaderboard' },
  { label: 'Roles', icon: 'pi pi-book', route: '/roles' },
]
```

**Mobile Navigation:** At `< md`, the Menubar collapses into a hamburger. PrimeVue Menubar handles this natively with its responsive breakpoint.

### 2.3 Content Container

```vue
<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <slot />
</main>
```

### 2.4 Page Title Pattern

Every page starts with a consistent title block:

```vue
<div class="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <Breadcrumb :model="breadcrumbs" />
    <h1 class="font-heading text-3xl font-bold">Page Title</h1>
    <p class="text-text-muted text-sm">Optional subtitle or description</p>
  </div>
  <div class="flex gap-2">
    <!-- Action buttons (admin only, etc.) -->
  </div>
</div>
```

---

## 3. Page Specifications

### 3.1 Home Page `/`

**Purpose:** Dashboard that shows the latest game, quick community stats, and a preview of the leaderboard. First impression for visitors.

#### Layout (Desktop)

```
+-----------------------------------------------------------+
|  HERO SECTION                                              |
|  "Blood on the Clocktower"         [Latest Game Summary]  |
|  "Kyiv Community Tracker"          Date: 2026-04-05       |
|                                    Script: Sects & Violets |
|  [View Games]  [Leaderboard]       Winner: Good           |
|                                    Players: 12            |
+-----------------------------------------------------------+
|                                                            |
|  QUICK STATS (4 cards in a row)                           |
|  [Total Games] [Active Players] [Next Sunday] [Top MVP]  |
|                                                            |
+-----------------------------------------------------------+
|                                                            |
|  LEADERBOARD PREVIEW          |  RECENT GAMES (3-5)      |
|  Top 5 by win rate            |  Card list with dates    |
|  [View Full ->]               |  [View All ->]           |
|                                                            |
+-----------------------------------------------------------+
```

#### Components and Implementation

**Hero Section:**
```vue
<section class="relative overflow-hidden rounded-xl bg-surface-card p-8 sm:p-12">
  <!-- Background: subtle gradient + optional clocktower silhouette SVG -->
  <div class="absolute inset-0 bg-gradient-to-br from-surface-card via-surface to-primary/10" />

  <div class="relative grid gap-8 lg:grid-cols-2">
    <!-- Left: Branding -->
    <div class="flex flex-col justify-center">
      <h1 class="font-heading text-4xl font-bold sm:text-5xl">
        Blood on the<br />
        <span class="text-primary">Clocktower</span>
      </h1>
      <p class="mt-2 text-lg text-text-muted">Kyiv Community Tracker</p>
      <div class="mt-6 flex gap-3">
        <Button label="View Games" icon="pi pi-list" />
        <Button label="Leaderboard" icon="pi pi-trophy" severity="secondary" outlined />
      </div>
    </div>

    <!-- Right: Latest Game Card -->
    <Card class="shadow-lg">
      <template #title>
        <div class="flex items-center justify-between">
          <span>Latest Game</span>
          <Tag :value="latestGame.winner" :severity="latestGame.winner === 'Good' ? 'success' : 'danger'" />
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-text-muted">Date</span>
            <p class="font-semibold">{{ formatDate(latestGame.date) }}</p>
          </div>
          <div>
            <span class="text-text-muted">Script</span>
            <p class="font-semibold">{{ latestGame.script }}</p>
          </div>
          <div>
            <span class="text-text-muted">Players</span>
            <p class="font-semibold">{{ latestGame.playerCount }}</p>
          </div>
          <div>
            <span class="text-text-muted">Storyteller</span>
            <p class="font-semibold">{{ latestGame.storyteller }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <NuxtLink :to="`/games/${latestGame.id}`">
          <Button label="View Details" text size="small" icon="pi pi-arrow-right" iconPos="right" />
        </NuxtLink>
      </template>
    </Card>
  </div>
</section>
```

**Quick Stats Row:**
- 4x `Card` components in a `grid grid-cols-2 lg:grid-cols-4 gap-4`
- Each card: icon (PrimeIcons) + number + label
- Use `pi pi-play` (games), `pi pi-users` (players), `pi pi-calendar` (next game), `pi pi-star` (MVP)

**Leaderboard Preview + Recent Games:**
- 2-column grid at `lg:`, stacked on mobile
- Leaderboard: simple `DataTable` with 5 rows, columns: Rank, Player (Avatar + name), Win Rate
- Recent Games: vertical card list using a v-for with `Card` components

**Responsive Behavior:**
- `< lg`: Hero stacks vertically (branding above, latest game card below)
- `< md`: Stats become 2x2 grid
- `< sm`: Stats stack to single column

---

### 3.2 Roles Catalog `/roles`

**Purpose:** Browse all ~154 BotC roles with filtering and search. Reference tool for players.

#### Layout

```
+-----------------------------------------------------------+
|  PAGE TITLE: "Ролі (Roles)"                               |
+-----------------------------------------------------------+
|  FILTERS BAR                                               |
|  [Search............] [Type: v] [Edition: v]  [Clear]     |
+-----------------------------------------------------------+
|                                                            |
|  ROLE GRID (responsive)                                   |
|  +------+ +------+ +------+ +------+ +------+ +------+   |
|  | Icon | | Icon | | Icon | | Icon | | Icon | | Icon |   |
|  | Name | | Name | | Name | | Name | | Name | | Name |   |
|  | Type | | Type | | Type | | Type | | Type | | Type |   |
|  +------+ +------+ +------+ +------+ +------+ +------+   |
|  +------+ +------+ +------+ +------+ +------+ +------+   |
|  | ...  | | ...  | | ...  | | ...  | | ...  | | ...  |   |
|  +------+ +------+ +------+ +------+ +------+ +------+   |
|                                                            |
+-----------------------------------------------------------+
```

#### Components

**Filter Bar:**
```vue
<div class="mb-6 flex flex-wrap items-center gap-3">
  <InputText
    v-model="search"
    placeholder="Search roles..."
    class="w-full sm:w-64"
  >
    <template #prefix>
      <i class="pi pi-search" />
    </template>
  </InputText>

  <MultiSelect
    v-model="selectedTypes"
    :options="roleTypes"
    optionLabel="label"
    optionValue="value"
    placeholder="Type"
    :maxSelectedLabels="2"
    class="w-full sm:w-48"
  />

  <MultiSelect
    v-model="selectedEditions"
    :options="editions"
    optionLabel="label"
    optionValue="value"
    placeholder="Edition"
    :maxSelectedLabels="2"
    class="w-full sm:w-48"
  />

  <Button
    v-if="hasActiveFilters"
    label="Clear"
    severity="secondary"
    text
    size="small"
    icon="pi pi-times"
    @click="clearFilters"
  />
</div>
```

**Role Type Options:**
```ts
const roleTypes = [
  { label: 'Townsfolk', value: 'townsfolk' },
  { label: 'Outsider', value: 'outsider' },
  { label: 'Minion', value: 'minion' },
  { label: 'Demon', value: 'demon' },
  { label: 'Traveller', value: 'traveller' },
  { label: 'Fabled', value: 'fabled' },
]

const editions = [
  { label: 'Trouble Brewing', value: 'tb' },
  { label: "Bad Moon Rising", value: 'bmr' },
  { label: 'Sects & Violets', value: 'snv' },
  { label: 'Experimental', value: 'experimental' },
  { label: 'Kickstarter', value: 'ks' },
  { label: 'Base 3', value: 'base3' },
]
```

**Role Card (in grid):**
```vue
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
  <div
    v-for="role in filteredRoles"
    :key="role.id"
    class="group cursor-pointer rounded-lg bg-surface-card p-4 text-center
           transition-all hover:shadow-card-hover hover:-translate-y-0.5"
    @click="openRoleDetail(role)"
  >
    <!-- Role icon/token image (circular, 64x64) -->
    <div class="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full
                ring-2 transition-all"
         :class="roleRingClass(role.type)"
    >
      <img :src="role.icon" :alt="role.name" class="h-full w-full object-cover" />
    </div>

    <!-- Bilingual name -->
    <p class="text-sm font-semibold leading-tight">{{ role.nameUk }}</p>
    <p class="text-xs text-text-muted">{{ role.nameEn }}</p>

    <!-- Type tag -->
    <Tag
      :value="role.type"
      :severity="roleTypeSeverity(role.type)"
      class="mt-2"
      rounded
    />
  </div>
</div>
```

**Role Detail Dialog:**
```vue
<Dialog
  v-model:visible="showDetail"
  :header="selectedRole?.nameUk"
  modal
  class="w-full max-w-lg"
  :dismissableMask="true"
>
  <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
    <!-- Large token image -->
    <div class="h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2"
         :class="roleRingClass(selectedRole?.type)">
      <img :src="selectedRole?.icon" :alt="selectedRole?.name" class="h-full w-full object-cover" />
    </div>

    <div class="flex-1">
      <h3 class="font-heading text-xl font-bold">
        {{ selectedRole?.nameUk }}
        <span class="text-text-muted font-normal">({{ selectedRole?.nameEn }})</span>
      </h3>

      <div class="mt-1 flex gap-2">
        <Tag :value="selectedRole?.type" :severity="roleTypeSeverity(selectedRole?.type)" rounded />
        <Tag :value="selectedRole?.edition" severity="secondary" rounded />
      </div>

      <p class="mt-4 text-sm leading-relaxed text-text-muted">
        {{ selectedRole?.description }}
      </p>

      <!-- Game stats for this role in our community -->
      <div class="mt-4 grid grid-cols-3 gap-3 rounded-md bg-surface p-3 text-center text-sm">
        <div>
          <p class="text-lg font-bold">{{ selectedRole?.timesPlayed }}</p>
          <p class="text-text-muted text-xs">Times Played</p>
        </div>
        <div>
          <p class="text-lg font-bold">{{ selectedRole?.winRate }}%</p>
          <p class="text-text-muted text-xs">Win Rate</p>
        </div>
        <div>
          <p class="text-lg font-bold">{{ selectedRole?.lastPlayed }}</p>
          <p class="text-text-muted text-xs">Last Played</p>
        </div>
      </div>
    </div>
  </div>
</Dialog>
```

**Responsive:**
- Grid columns reduce: 6 -> 5 -> 4 -> 3 -> 2 as viewport narrows
- Filters stack vertically on `< sm`
- Dialog becomes full-screen on mobile (`maximizable` + `breakpoints="{ '640px': '100vw' }"`)

**Loading State:**
```vue
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
  <div v-for="i in 18" :key="i" class="rounded-lg bg-surface-card p-4 text-center">
    <Skeleton shape="circle" size="4rem" class="mx-auto mb-3" />
    <Skeleton width="80%" height="1rem" class="mx-auto mb-1" />
    <Skeleton width="60%" height="0.75rem" class="mx-auto mb-2" />
    <Skeleton width="50%" height="1.5rem" class="mx-auto" borderRadius="9999px" />
  </div>
</div>
```

**Empty State:**
```vue
<div class="flex flex-col items-center justify-center py-16 text-center">
  <i class="pi pi-search text-4xl text-text-subtle mb-4" />
  <p class="text-lg font-semibold">No roles found</p>
  <p class="text-text-muted text-sm">Try adjusting your filters or search term</p>
  <Button label="Clear Filters" severity="secondary" text class="mt-4" @click="clearFilters" />
</div>
```

---

### 3.3 Games List `/games`

**Purpose:** Browse all past games with filtering capabilities.

#### Layout

```
+-----------------------------------------------------------+
|  PAGE TITLE: "Ігри (Games)"           [+ New Game] admin  |
+-----------------------------------------------------------+
|  FILTERS: [Date Range] [Script: v] [Winner: v] [Search]  |
+-----------------------------------------------------------+
|                                                            |
|  GAMES TABLE (desktop) / CARDS (mobile)                   |
|  # | Date       | Script          | Winner | Players | ST |
|  1 | 05.04.2026 | Trouble Brewing | Good   | 12      | -> |
|  2 | 29.03.2026 | Sects & Violets | Evil   | 10      | -> |
|  ...                                                      |
|  [Paginator: < 1 2 3 4 5 >]                              |
|                                                            |
+-----------------------------------------------------------+
```

#### Components

**Desktop: DataTable**
```vue
<DataTable
  :value="games"
  :paginator="true"
  :rows="15"
  :rowsPerPageOptions="[10, 15, 25, 50]"
  sortField="date"
  :sortOrder="-1"
  stripedRows
  rowHover
  @row-click="navigateToGame"
  class="hidden md:block"
>
  <Column field="number" header="#" sortable style="width: 60px" />
  <Column field="date" header="Date" sortable>
    <template #body="{ data }">
      {{ formatDate(data.date) }}
    </template>
  </Column>
  <Column field="script" header="Script" sortable>
    <template #body="{ data }">
      <Tag :value="data.script" severity="secondary" />
    </template>
  </Column>
  <Column field="winner" header="Winner" sortable>
    <template #body="{ data }">
      <Tag
        :value="data.winner"
        :severity="data.winner === 'Good' ? 'success' : 'danger'"
        :icon="data.winner === 'Good' ? 'pi pi-sun' : 'pi pi-moon'"
      />
    </template>
  </Column>
  <Column field="playerCount" header="Players" sortable style="width: 100px" />
  <Column field="storyteller" header="Storyteller" />
  <Column style="width: 50px">
    <template #body>
      <i class="pi pi-chevron-right text-text-subtle" />
    </template>
  </Column>
</DataTable>
```

**Mobile: Card List**
```vue
<div class="flex flex-col gap-3 md:hidden">
  <Card
    v-for="game in paginatedGames"
    :key="game.id"
    class="cursor-pointer transition-all hover:shadow-card-hover"
    @click="navigateToGame(game)"
  >
    <template #content>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold">{{ formatDate(game.date) }}</p>
          <p class="text-sm text-text-muted">{{ game.script }}</p>
        </div>
        <div class="flex items-center gap-2">
          <Tag
            :value="game.winner"
            :severity="game.winner === 'Good' ? 'success' : 'danger'"
          />
          <Badge :value="game.playerCount" severity="secondary" />
        </div>
      </div>
    </template>
  </Card>

  <!-- Mobile paginator -->
  <Paginator
    :rows="15"
    :totalRecords="totalGames"
    v-model:first="first"
  />
</div>
```

**Admin Difference:**
- Admin sees `Button label="+ New Game"` in the page title area
- Row actions (edit/delete) shown to admin via a `Menu` component per row

---

### 3.4 Game Detail `/games/[id]`

**Purpose:** Full details of a single game including the player roster.

#### Layout

```
+-----------------------------------------------------------+
|  BREADCRUMB: Home > Games > Game #42                       |
+-----------------------------------------------------------+
|  GAME HEADER                                               |
|  Date: 05.04.2026    Script: Trouble Brewing               |
|  Winner: [Good]      Storyteller: Arthur                   |
|  Players: 12         Notes: "Great demon bluff"           |
|                                     [Edit] [Delete] admin  |
+-----------------------------------------------------------+
|                                                            |
|  PLAYERS TABLE                                             |
|  Avatar | Name    | Start Role      | End Role  | Align | |
|  [AV]   | Player1 | Емпат (Empath)  | same      | Good  | |
|  [AV]   | Player2 | Імп (Imp)       | same      | Evil  | |
|  ...                                                       |
|  Status: Alive/Dead  |  MVP star                          |
|                                                            |
|  [+ Join Game] (logged-in player, not yet in game)        |
|                                                            |
+-----------------------------------------------------------+
```

#### Components

**Game Info Header:**
```vue
<Card class="mb-6">
  <template #content>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <InfoField label="Date" :value="formatDate(game.date)" icon="pi pi-calendar" />
      <InfoField label="Script" icon="pi pi-book">
        <Tag :value="game.script" severity="secondary" />
      </InfoField>
      <InfoField label="Winner" icon="pi pi-flag">
        <Tag
          :value="game.winner"
          :severity="game.winner === 'Good' ? 'success' : 'danger'"
          :icon="game.winner === 'Good' ? 'pi pi-sun' : 'pi pi-moon'"
        />
      </InfoField>
      <InfoField label="Storyteller" :value="game.storyteller" icon="pi pi-user" />
    </div>
    <p v-if="game.notes" class="mt-4 rounded-md bg-surface p-3 text-sm text-text-muted italic">
      {{ game.notes }}
    </p>
  </template>
</Card>
```

**Players Table (Desktop):**
```vue
<DataTable :value="game.players" stripedRows>
  <Column header="Player" style="min-width: 200px">
    <template #body="{ data }">
      <div class="flex items-center gap-3">
        <Avatar :label="data.initials" shape="circle" size="small" />
        <NuxtLink :to="`/players/${data.id}`" class="font-semibold hover:text-primary">
          {{ data.nickname }}
        </NuxtLink>
        <i v-if="data.isMvp" class="pi pi-star-fill text-accent" v-tooltip="'MVP'" />
      </div>
    </template>
  </Column>
  <Column header="Starting Role">
    <template #body="{ data }">
      <RoleBadge :role="data.startingRole" />
    </template>
  </Column>
  <Column header="Ending Role">
    <template #body="{ data }">
      <RoleBadge v-if="data.endingRole !== data.startingRole" :role="data.endingRole" />
      <span v-else class="text-text-subtle text-sm">--</span>
    </template>
  </Column>
  <Column header="Alignment" style="width: 120px">
    <template #body="{ data }">
      <Tag
        :value="data.alignment"
        :severity="data.alignment === 'Good' ? 'success' : 'danger'"
        rounded
      />
    </template>
  </Column>
  <Column header="Status" style="width: 100px">
    <template #body="{ data }">
      <Tag
        :value="data.alive ? 'Alive' : 'Dead'"
        :severity="data.alive ? 'success' : 'secondary'"
        :icon="data.alive ? 'pi pi-heart-fill' : 'pi pi-times'"
        rounded
      />
    </template>
  </Column>
</DataTable>
```

**RoleBadge Component (reusable):**
```vue
<!-- components/RoleBadge.vue -->
<template>
  <div class="inline-flex items-center gap-2">
    <div
      class="h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1"
      :class="roleRingClass"
    >
      <img :src="role.icon" :alt="role.nameEn" class="h-full w-full object-cover" />
    </div>
    <span class="text-sm">
      <span class="font-medium">{{ role.nameUk }}</span>
      <span class="text-text-muted"> ({{ role.nameEn }})</span>
    </span>
  </div>
</template>
```

**Join Game Button (Player only):**
```vue
<div v-if="isAuthenticated && !isInGame" class="mt-4">
  <Button
    label="Join This Game"
    icon="pi pi-plus"
    @click="showJoinDialog = true"
  />
</div>
```

**Join Dialog:** A `Dialog` with `AutoComplete` for role selection, `Select` for alignment, `ToggleSwitch` for alive/dead.

**Admin Actions:**
- Edit and Delete buttons in the header
- Inline editing via clicking cells in the DataTable (or edit dialog per player row)
- `ConfirmDialog` before deletion

**Mobile:** Players DataTable switches to stacked card layout (see Section 7).

---

### 3.5 Create Game `/games/new` (Admin Only)

**Purpose:** Admin creates a new game record and adds players.

#### Layout

```
+-----------------------------------------------------------+
|  PAGE TITLE: "New Game"                                    |
+-----------------------------------------------------------+
|  GAME FORM                                                 |
|  Date: [DatePicker]        Script: [Select]               |
|  Winner: [Select Good/Evil] Storyteller: [AutoComplete]   |
|  Notes: [Textarea]                                         |
+-----------------------------------------------------------+
|  PLAYERS                                                   |
|  +--Player Row-------------------------------------+      |
|  | [AutoComplete: Player] [AutoComplete: Role]     |      |
|  | [Select: Alignment] [Toggle: Alive] [MVP] [X]  |      |
|  +------------------------------------------------+      |
|  +--Player Row-------------------------------------+      |
|  | ...                                             |      |
|  +------------------------------------------------+      |
|  [+ Add Player]                                           |
+-----------------------------------------------------------+
|  [Cancel]                                [Save Game]      |
+-----------------------------------------------------------+
```

#### Components

```vue
<form @submit.prevent="saveGame" class="flex flex-col gap-6">
  <!-- Game info section -->
  <Card>
    <template #title>Game Details</template>
    <template #content>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Date</label>
          <DatePicker v-model="form.date" dateFormat="dd.mm.yy" showIcon />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Script</label>
          <Select
            v-model="form.script"
            :options="scriptOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select script"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Winner</label>
          <Select
            v-model="form.winner"
            :options="[
              { label: 'Good', value: 'good' },
              { label: 'Evil', value: 'evil' }
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="Who won?"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Storyteller</label>
          <AutoComplete
            v-model="form.storyteller"
            :suggestions="playerSuggestions"
            optionLabel="nickname"
            placeholder="Search players..."
            @complete="searchPlayers"
          />
        </div>
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label class="text-sm font-medium">Notes</label>
          <Textarea v-model="form.notes" rows="3" placeholder="Optional game notes..." />
        </div>
      </div>
    </template>
  </Card>

  <!-- Players section -->
  <Card>
    <template #title>
      <div class="flex items-center justify-between">
        <span>Players</span>
        <Badge :value="form.players.length" />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-3">
        <div
          v-for="(player, index) in form.players"
          :key="index"
          class="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-3"
        >
          <div class="flex flex-col gap-1 grow basis-40">
            <label class="text-xs text-text-muted">Player</label>
            <AutoComplete
              v-model="player.player"
              :suggestions="playerSuggestions"
              optionLabel="nickname"
              placeholder="Player name..."
              @complete="searchPlayers"
            />
          </div>
          <div class="flex flex-col gap-1 grow basis-40">
            <label class="text-xs text-text-muted">Role</label>
            <AutoComplete
              v-model="player.role"
              :suggestions="roleSuggestions"
              optionLabel="nameDisplay"
              placeholder="Role..."
              @complete="searchRoles"
            >
              <template #option="{ option }">
                <RoleBadge :role="option" />
              </template>
            </AutoComplete>
          </div>
          <div class="flex flex-col gap-1 basis-28">
            <label class="text-xs text-text-muted">Alignment</label>
            <Select
              v-model="player.alignment"
              :options="['Good', 'Evil']"
              placeholder="Align."
            />
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-xs text-text-muted">Alive</label>
              <ToggleSwitch v-model="player.alive" />
            </div>
            <Button
              v-tooltip="'MVP'"
              :icon="player.isMvp ? 'pi pi-star-fill' : 'pi pi-star'"
              :severity="player.isMvp ? 'warn' : 'secondary'"
              text
              rounded
              @click="toggleMvp(index)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="removePlayer(index)"
            />
          </div>
        </div>
      </div>

      <Button
        label="Add Player"
        icon="pi pi-plus"
        severity="secondary"
        outlined
        class="mt-4"
        @click="addPlayer"
      />
    </template>
  </Card>

  <!-- Actions -->
  <div class="flex justify-end gap-3">
    <Button label="Cancel" severity="secondary" outlined @click="navigateBack" />
    <Button type="submit" label="Save Game" icon="pi pi-check" :loading="saving" />
  </div>
</form>
```

**Role AutoComplete** shows the `RoleBadge` in the dropdown options and filters by name in both Ukrainian and English. The `nameDisplay` field is pre-computed as `"Емпат (Empath)"`.

---

### 3.6 Player Profile `/players/[id]`

**Purpose:** Detailed stats and game history for a single player.

#### Layout

```
+-----------------------------------------------------------+
|  PROFILE HEADER                                            |
|  [Avatar]  PlayerName                                     |
|            Member since: Jan 2024                         |
|            Last game: 05.04.2026                          |
+-----------------------------------------------------------+
|                                                            |
|  STATS GRID (4-6 stat cards)                              |
|  [Games] [Win Rate] [MVPs] [Survival] [Good%] [Evil%]   |
|                                                            |
+-----------------------------------------------------------+
|                                                            |
|  ROLE DISTRIBUTION         |  WIN RATE OVER TIME          |
|  (Doughnut Chart)          |  (Line Chart)                |
|                                                            |
+-----------------------------------------------------------+
|                                                            |
|  GAME HISTORY TABLE                                       |
|  # | Date | Script | Role | Alignment | Status | Result  |
|  ...                                                      |
|                                                            |
+-----------------------------------------------------------+
```

#### Components

**Profile Header:**
```vue
<div class="flex items-center gap-4 sm:gap-6">
  <Avatar
    :label="player.initials"
    :image="player.avatarUrl"
    shape="circle"
    size="xlarge"
    class="h-20 w-20 text-2xl"
  />
  <div>
    <h1 class="font-heading text-2xl font-bold sm:text-3xl">{{ player.nickname }}</h1>
    <p class="text-text-muted text-sm">
      Member since {{ formatDate(player.joinedAt) }}
      <span class="mx-2">|</span>
      Last game: {{ formatDate(player.lastGameDate) }}
    </p>
  </div>
</div>
```

**Stats Grid:**
```vue
<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
  <StatCard label="Games" :value="stats.totalGames" icon="pi pi-play" />
  <StatCard label="Win Rate" :value="`${stats.winRate}%`" icon="pi pi-percentage" />
  <StatCard label="MVPs" :value="stats.mvpCount" icon="pi pi-star" highlight />
  <StatCard label="Survival" :value="`${stats.survivalRate}%`" icon="pi pi-heart" />
  <StatCard label="Good Wins" :value="`${stats.goodWinRate}%`" icon="pi pi-sun" color="good" />
  <StatCard label="Evil Wins" :value="`${stats.evilWinRate}%`" icon="pi pi-moon" color="evil" />
</div>
```

**StatCard Component:**
```vue
<!-- components/StatCard.vue -->
<template>
  <div class="rounded-lg bg-surface-card p-4 text-center">
    <i :class="[icon, 'text-xl mb-1']" :style="iconStyle" />
    <p class="text-2xl font-bold" :class="valueClass">{{ value }}</p>
    <p class="text-xs text-text-muted">{{ label }}</p>
  </div>
</template>
```

**Charts:** Use PrimeVue `Chart` component (wraps Chart.js):

```vue
<div class="mt-6 grid gap-6 lg:grid-cols-2">
  <!-- Role Distribution (Doughnut) -->
  <Card>
    <template #title>Role Distribution</template>
    <template #content>
      <Chart type="doughnut" :data="roleDistributionData" :options="doughnutOptions" />
    </template>
  </Card>

  <!-- Win Rate Over Time (Line) -->
  <Card>
    <template #title>Win Rate Trend</template>
    <template #content>
      <Chart type="line" :data="winRateTrendData" :options="lineOptions" />
    </template>
  </Card>
</div>
```

Doughnut chart segments use role type colors (townsfolk blue, outsider teal, etc.).

**Game History Table:** Same pattern as Games List DataTable but with role-specific columns.

---

### 3.7 Leaderboard `/leaderboard`

**Purpose:** Competitive rankings across multiple metrics.

#### Layout

```
+-----------------------------------------------------------+
|  PAGE TITLE: "Leaderboard"                                 |
+-----------------------------------------------------------+
|  TABS: [By Wins] [Win %] [MVP Count] [Games Played]      |
+-----------------------------------------------------------+
|  ALIGNMENT TOGGLE: [All] [Good] [Evil]                    |
+-----------------------------------------------------------+
|                                                            |
|  RANKING TABLE                                            |
|  Rank | Player         | Metric Value | Games | Trend    |
|  1    | [AV] Player1   | 85%          | 42    | +3       |
|  2    | [AV] Player2   | 78%          | 38    | -1       |
|  ...                                                      |
|                                                            |
+-----------------------------------------------------------+
```

#### Components

```vue
<Tabs v-model:value="activeTab">
  <TabList>
    <Tab value="wins">By Wins</Tab>
    <Tab value="winrate">Win %</Tab>
    <Tab value="mvp">MVP Count</Tab>
    <Tab value="games">Games Played</Tab>
  </TabList>

  <!-- Alignment filter -->
  <div class="my-4 flex gap-2">
    <Button
      v-for="align in ['All', 'Good', 'Evil']"
      :key="align"
      :label="align"
      :severity="selectedAlignment === align ? undefined : 'secondary'"
      :outlined="selectedAlignment !== align"
      size="small"
      @click="selectedAlignment = align"
    />
  </div>

  <TabPanels>
    <TabPanel value="wins">
      <LeaderboardTable :data="winsSorted" metricLabel="Wins" metricField="wins" />
    </TabPanel>
    <TabPanel value="winrate">
      <LeaderboardTable :data="winRateSorted" metricLabel="Win %" metricField="winRate" suffix="%" />
    </TabPanel>
    <TabPanel value="mvp">
      <LeaderboardTable :data="mvpSorted" metricLabel="MVPs" metricField="mvpCount" />
    </TabPanel>
    <TabPanel value="games">
      <LeaderboardTable :data="gamesSorted" metricLabel="Games" metricField="gamesPlayed" />
    </TabPanel>
  </TabPanels>
</Tabs>
```

**LeaderboardTable Component:**

Top 3 players get special treatment:
- Rank 1: Gold medal icon, slightly larger row, subtle gold glow
- Rank 2: Silver styling
- Rank 3: Bronze styling

```vue
<DataTable :value="data" :paginator="data.length > 20" :rows="20">
  <Column header="Rank" style="width: 80px">
    <template #body="{ index }">
      <span v-if="index === 0" class="text-lg">&#129351;</span> <!-- gold medal -->
      <span v-else-if="index === 1" class="text-lg">&#129352;</span> <!-- silver -->
      <span v-else-if="index === 2" class="text-lg">&#129353;</span> <!-- bronze -->
      <span v-else class="text-text-muted pl-1">{{ index + 1 }}</span>
    </template>
  </Column>
  <Column header="Player" style="min-width: 200px">
    <template #body="{ data }">
      <NuxtLink :to="`/players/${data.id}`" class="flex items-center gap-3 hover:text-primary">
        <Avatar :label="data.initials" shape="circle" size="small" />
        <span class="font-semibold">{{ data.nickname }}</span>
      </NuxtLink>
    </template>
  </Column>
  <Column :header="metricLabel" :field="metricField" sortable style="width: 120px">
    <template #body="{ data }">
      <span class="text-lg font-bold text-primary">
        {{ data[metricField] }}{{ suffix }}
      </span>
    </template>
  </Column>
  <Column header="Games" field="gamesPlayed" sortable style="width: 100px" />
</DataTable>
```

**Mobile:** Stacked card layout with rank prominently displayed.

---

### 3.8 Players List `/players`

**Purpose:** Grid of all community players with basic stats.

#### Layout

```
+-----------------------------------------------------------+
|  PAGE TITLE: "Players"                   [Search........]  |
+-----------------------------------------------------------+
|                                                            |
|  PLAYER CARDS GRID                                        |
|  +----------+ +----------+ +----------+ +----------+     |
|  | [Avatar] | | [Avatar] | | [Avatar] | | [Avatar] |     |
|  | Name     | | Name     | | Name     | | Name     |     |
|  | 42 games | | 38 games | | 35 games | | 28 games |     |
|  | 65% win  | | 71% win  | | 58% win  | | 62% win  |     |
|  +----------+ +----------+ +----------+ +----------+     |
|                                                            |
+-----------------------------------------------------------+
```

#### Components

```vue
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
  <NuxtLink
    v-for="player in filteredPlayers"
    :key="player.id"
    :to="`/players/${player.id}`"
    class="group rounded-lg bg-surface-card p-4 text-center
           transition-all hover:shadow-card-hover hover:-translate-y-0.5"
  >
    <Avatar
      :label="player.initials"
      :image="player.avatarUrl"
      shape="circle"
      size="large"
      class="mx-auto mb-3"
    />
    <p class="font-semibold group-hover:text-primary transition-colors">
      {{ player.nickname }}
    </p>
    <div class="mt-2 flex justify-center gap-3 text-xs text-text-muted">
      <span>{{ player.gamesPlayed }} games</span>
      <span>{{ player.winRate }}% win</span>
    </div>
    <div v-if="player.mvpCount > 0" class="mt-1">
      <Badge :value="`${player.mvpCount} MVP`" severity="warn" />
    </div>
  </NuxtLink>
</div>
```

---

## 4. Role Type Color Coding

### Color Assignments

| Type        | Color Name | CSS Variable       | Hex Approx | Ring Class                            | Tag Severity   |
|-------------|------------|--------------------|------------|---------------------------------------|----------------|
| Townsfolk   | Blue       | `--color-townsfolk`| `#3B82F6`  | `ring-townsfolk`                      | `info`         |
| Outsider    | Teal       | `--color-outsider` | `#06B6D4`  | `ring-outsider`                       | `secondary`*   |
| Minion      | Orange     | `--color-minion`   | `#F97316`  | `ring-minion`                         | `warn`         |
| Demon       | Red        | `--color-demon`    | `#EF4444`  | `ring-demon`                          | `danger`       |
| Traveller   | Purple     | `--color-traveller`| `#8B5CF6`  | `ring-traveller`                      | `contrast`*    |
| Fabled      | Gold       | `--color-fabled`   | `#D4A017`  | `ring-fabled`                         | `warn`*        |

*These do not perfectly match PrimeVue severity colors, so we use **custom CSS** for Tags:

### Custom Tag Styles

Since PrimeVue Tag only has 7 severity values (primary, secondary, success, info, warn, danger, contrast), and we need 6 distinct role colors, we create custom role tag variants:

```css
/* assets/css/role-tags.css */

/* Townsfolk - Blue (maps well to 'info') */
.p-tag-townsfolk {
  background-color: color-mix(in srgb, var(--color-townsfolk) 15%, transparent);
  color: var(--color-townsfolk);
  border: 1px solid color-mix(in srgb, var(--color-townsfolk) 30%, transparent);
}

/* Outsider - Teal */
.p-tag-outsider {
  background-color: color-mix(in srgb, var(--color-outsider) 15%, transparent);
  color: var(--color-outsider);
  border: 1px solid color-mix(in srgb, var(--color-outsider) 30%, transparent);
}

/* Minion - Orange (maps well to 'warn') */
.p-tag-minion {
  background-color: color-mix(in srgb, var(--color-minion) 15%, transparent);
  color: var(--color-minion);
  border: 1px solid color-mix(in srgb, var(--color-minion) 30%, transparent);
}

/* Demon - Red (maps well to 'danger') */
.p-tag-demon {
  background-color: color-mix(in srgb, var(--color-demon) 15%, transparent);
  color: var(--color-demon);
  border: 1px solid color-mix(in srgb, var(--color-demon) 30%, transparent);
}

/* Traveller - Purple */
.p-tag-traveller {
  background-color: color-mix(in srgb, var(--color-traveller) 15%, transparent);
  color: var(--color-traveller);
  border: 1px solid color-mix(in srgb, var(--color-traveller) 30%, transparent);
}

/* Fabled - Gold */
.p-tag-fabled {
  background-color: color-mix(in srgb, var(--color-fabled) 15%, transparent);
  color: var(--color-fabled);
  border: 1px solid color-mix(in srgb, var(--color-fabled) 30%, transparent);
}
```

### Usage Helper

```ts
// composables/useRoleType.ts
export function useRoleType() {
  const roleTypeClass = (type: string): string => {
    return `p-tag-${type.toLowerCase()}`
  }

  const roleRingClass = (type: string): string => {
    const map: Record<string, string> = {
      townsfolk: 'ring-townsfolk',
      outsider: 'ring-outsider',
      minion: 'ring-minion',
      demon: 'ring-demon',
      traveller: 'ring-traveller',
      fabled: 'ring-fabled',
    }
    return map[type.toLowerCase()] ?? 'ring-surface-border'
  }

  return { roleTypeClass, roleRingClass }
}
```

```vue
<!-- Usage in template -->
<Tag :value="role.type" :class="roleTypeClass(role.type)" />
```

### Alignment Colors

| Alignment | Color Variable  | Visual Treatment                       |
|-----------|----------------|----------------------------------------|
| Good      | `--color-good` | Green tag, sun icon (`pi pi-sun`)      |
| Evil      | `--color-evil` | Red tag, moon icon (`pi pi-moon`)      |

### Status Colors

| Status | Visual Treatment                                      |
|--------|-------------------------------------------------------|
| Alive  | Green tag with heart icon (`pi pi-heart-fill`)        |
| Dead   | Muted/gray tag with X icon (`pi pi-times`), strikethrough on name |

---

## 5. Dark Mode Implementation

### Strategy

BotC Tracker is **dark-mode-first**. The app ships in dark mode by default. An optional light mode can be toggled, but the primary experience is dark.

### PrimeVue Aura Configuration

```ts
// nuxt.config.ts (or plugins/primevue.ts)
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const BotCPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{red.50}',
      100: '{red.100}',
      200: '{red.200}',
      300: '{red.300}',
      400: '{red.400}',
      500: '{red.500}',
      600: '{red.600}',
      700: '{red.700}',
      800: '{red.800}',
      900: '{red.900}',
      950: '{red.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
})

export default defineNuxtConfig({
  modules: ['@primevue/nuxt-module'],
  primevue: {
    options: {
      theme: {
        preset: BotCPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
    },
  },
})
```

### Dark Mode Toggle

Use `@vueuse/core` `useColorMode` or a simple composable:

```ts
// composables/useTheme.ts
export function useTheme() {
  const isDark = useState('theme-dark', () => true) // default dark

  const toggle = () => {
    isDark.value = !isDark.value
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  // Initialize on client
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark, toggle }
}
```

In the header, add a toggle:

```vue
<Button
  :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'"
  severity="secondary"
  text
  rounded
  @click="toggle"
  v-tooltip="isDark ? 'Light mode' : 'Dark mode'"
/>
```

### Custom Surface Overrides for BotC Atmosphere

Override PrimeVue surface variables in the dark context to push the design toward the BotC night theme:

```css
.dark {
  /* Override PrimeVue surfaces with our night palette */
  --p-surface-0: var(--botc-night-0);
  --p-surface-50: var(--botc-night-50);
  --p-surface-100: var(--botc-night-100);
  --p-surface-200: var(--botc-night-200);
  --p-surface-300: var(--botc-night-300);
  --p-surface-400: var(--botc-night-400);
  --p-surface-500: var(--botc-night-500);
  --p-surface-600: var(--botc-night-600);
  --p-surface-700: var(--botc-night-700);
  --p-surface-800: var(--botc-night-800);
  --p-surface-900: var(--botc-night-900);
  --p-surface-950: var(--botc-night-950);

  /* App background */
  --p-content-background: var(--botc-night-950);

  /* Primary overrides to blood red */
  --p-primary-color: var(--botc-red-500);
  --p-primary-contrast-color: #ffffff;
  --p-primary-hover-color: var(--botc-red-400);
  --p-primary-active-color: var(--botc-red-600);
}
```

---

## 6. Animations and Transitions

### Page Transitions

Use Nuxt's built-in page transition with a subtle fade + slide:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
})
```

```css
/* assets/css/transitions.css */

/* Page transition: fade + slight upward slide */
.page-enter-active,
.page-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Layout transition */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 150ms ease;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
```

### Card Hover Effects

```css
/* Applied via Tailwind utility classes */
.card-hover {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
```

Or in Tailwind v4 notation directly on elements:
```html
<div class="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
```

### Dialog Animations

PrimeVue Dialog has built-in transitions. Customize with:

```css
/* Make PrimeVue Dialog slide up from bottom on mobile */
@media (max-width: 640px) {
  .p-dialog-enter-from,
  .p-dialog-leave-to {
    transform: translateY(100%);
    opacity: 1;
  }
  .p-dialog-enter-active,
  .p-dialog-leave-active {
    transition: transform 300ms cubic-bezier(0.33, 1, 0.68, 1);
  }
}
```

### Skeleton Loading

Use PrimeVue `Skeleton` component to match the exact shape of loaded content. Key patterns:

```vue
<!-- Table skeleton -->
<div v-if="loading" class="flex flex-col gap-2">
  <Skeleton v-for="i in 10" :key="i" height="3rem" />
</div>

<!-- Card grid skeleton -->
<div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
  <div v-for="i in 8" :key="i" class="rounded-lg bg-surface-card p-4">
    <Skeleton shape="circle" size="3rem" class="mx-auto mb-3" />
    <Skeleton width="80%" height="1rem" class="mx-auto mb-1" />
    <Skeleton width="60%" height="0.75rem" class="mx-auto" />
  </div>
</div>

<!-- Stats card skeleton -->
<Skeleton height="5rem" borderRadius="0.75rem" />
```

### Micro-interactions

| Element              | Interaction        | Animation                                    |
|----------------------|--------------------|----------------------------------------------|
| Buttons              | Hover              | Slight scale (1.02) + brightness increase    |
| Cards                | Hover              | translateY(-2px) + shadow elevation           |
| Tags                 | Hover              | Brightness increase                           |
| Avatar               | Hover              | Ring glow effect (box-shadow)                 |
| MVP star             | Awarded            | Scale bounce (1 -> 1.3 -> 1) with gold glow  |
| Win/Loss indicator   | Appear             | Fade in + slide from left                     |
| Table rows           | Hover              | Background color change with 150ms transition |
| Navigation links     | Active             | Underline slide-in from left                  |

### Number Counter Animation

For stat values on the Player Profile, animate numbers counting up:

```ts
// composables/useCountUp.ts
export function useCountUp(target: Ref<number>, duration = 800) {
  const display = ref(0)

  watch(target, (newVal) => {
    const start = display.value
    const diff = newVal - start
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      display.value = Math.round(start + diff * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, { immediate: true })

  return display
}
```

---

## 7. Mobile-First Responsive Patterns

### DataTable to Cards Transformation

The primary pattern for responsive data: DataTable on desktop, stacked cards on mobile.

```vue
<!-- Desktop table (hidden below md) -->
<DataTable :value="data" class="hidden md:block" ... />

<!-- Mobile cards (visible below md) -->
<div class="flex flex-col gap-3 md:hidden">
  <div
    v-for="item in data"
    :key="item.id"
    class="rounded-lg bg-surface-card p-4"
  >
    <!-- Card content structured for mobile -->
    <div class="flex items-center justify-between mb-2">
      <span class="font-semibold">{{ item.primaryField }}</span>
      <Tag ... />
    </div>
    <div class="grid grid-cols-2 gap-2 text-sm text-text-muted">
      <div>
        <span class="text-xs uppercase">Label</span>
        <p>{{ item.field1 }}</p>
      </div>
      <div>
        <span class="text-xs uppercase">Label</span>
        <p>{{ item.field2 }}</p>
      </div>
    </div>
  </div>
</div>
```

### Touch-Friendly Targets

- Minimum tap target: 44x44px (Apple HIG) / 48x48px (Material)
- All interactive elements have at least `p-3` (12px) padding
- Card click areas extend to the full card surface
- Bottom action buttons have extra padding on mobile

### Navigation on Mobile

PrimeVue Menubar collapses to a hamburger at the configured breakpoint. The mobile menu slides in as a sidebar (Drawer):

```vue
<!-- Alternative: use Drawer for mobile nav -->
<Drawer v-model:visible="mobileMenuVisible" position="left">
  <template #header>
    <span class="font-heading text-lg font-bold">BotC Tracker</span>
  </template>
  <Menu :model="menuItems" class="w-full border-none" />
</Drawer>
```

### Responsive Patterns Summary

| Component       | Desktop              | Tablet             | Mobile                    |
|-----------------|---------------------|--------------------|---------------------------|
| Navigation      | Full Menubar        | Full Menubar       | Hamburger + Drawer        |
| Data tables     | DataTable           | DataTable (scroll) | Stacked cards             |
| Stats grid      | 6 columns           | 3 columns          | 2 columns                 |
| Role grid       | 6 columns           | 4 columns          | 2 columns                 |
| Player grid     | 5 columns           | 3 columns          | 2 columns                 |
| Charts          | Side by side        | Side by side       | Stacked vertically        |
| Dialogs         | Centered modal      | Centered modal     | Full-screen bottom sheet  |
| Game form       | 2-column grid       | 2-column grid      | Single column             |
| Leaderboard     | Full table          | Compact table      | Stacked cards             |

### Bottom Sheet Dialog on Mobile

```vue
<Dialog
  v-model:visible="showDialog"
  modal
  :dismissableMask="true"
  :breakpoints="{ '640px': '100vw' }"
  :style="{ width: '540px' }"
  :position="isMobile ? 'bottom' : 'center'"
  :class="{ 'rounded-b-none': isMobile }"
>
  <!-- Content -->
</Dialog>
```

---

## 8. Authorization UI Patterns

### Visual Differences by Role

| UI Element               | Guest           | Player (logged in)  | Admin               |
|--------------------------|-----------------|---------------------|----------------------|
| Header right side        | "Sign In" btn   | Avatar + dropdown   | Avatar + admin badge |
| Game detail              | View only       | "Join Game" button  | Edit/Delete buttons  |
| Game detail players      | Read only       | Edit own row        | Edit any row         |
| Games list               | No create       | No create           | "+ New Game" button  |
| Player profile           | View only       | Edit own profile    | Edit any profile     |
| Game delete              | Hidden          | Hidden              | ConfirmDialog        |

### Admin Badge

```vue
<Avatar :label="userInitials" shape="circle">
  <template #default>
    <!-- Avatar content -->
  </template>
</Avatar>
<Badge v-if="isAdmin" value="Admin" severity="danger" class="absolute -top-1 -right-1" />
```

### Guarded Buttons

```vue
<!-- Only show if admin -->
<Button
  v-if="isAdmin"
  label="Edit Game"
  icon="pi pi-pencil"
  severity="secondary"
  outlined
/>

<!-- Only show if logged-in player, not already in game -->
<Button
  v-if="isAuthenticated && !isPlayerInGame"
  label="Join Game"
  icon="pi pi-plus"
/>
```

### Login Prompt

When a guest clicks a player-only action, show a `Toast` or redirect:

```ts
const requireAuth = (action: () => void) => {
  if (!isAuthenticated.value) {
    toast.add({
      severity: 'info',
      summary: 'Sign in required',
      detail: 'Please sign in to perform this action',
      life: 3000,
    })
    return
  }
  action()
}
```

---

## Appendix A: Full Component Inventory

| Component        | PrimeVue Name  | Usage Locations                              |
|------------------|---------------|----------------------------------------------|
| `Menubar`        | Menubar       | AppHeader                                    |
| `Menu`           | Menu          | User dropdown, row actions                   |
| `Breadcrumb`     | Breadcrumb    | Page titles (game detail, player profile)    |
| `Button`         | Button        | Everywhere (CTAs, actions, filters)          |
| `Card`           | Card          | Stats, game cards, player cards              |
| `DataTable`      | DataTable     | Games list, game players, leaderboard, history |
| `Column`         | Column        | Inside DataTable                             |
| `DataView`       | DataView      | Alternative for roles grid (optional)        |
| `Tag`            | Tag           | Role types, alignment, winner, status        |
| `Badge`          | Badge         | Player counts, MVP count, admin indicator    |
| `Avatar`         | Avatar        | Player avatars in tables and profiles        |
| `InputText`      | InputText     | Search fields, text inputs                   |
| `Textarea`       | Textarea      | Game notes                                   |
| `Select`         | Select        | Script, alignment, winner dropdowns          |
| `MultiSelect`    | MultiSelect   | Role type filter, edition filter             |
| `AutoComplete`   | AutoComplete  | Player search, role search (with templates)  |
| `DatePicker`     | DatePicker    | Game date selection                          |
| `ToggleSwitch`   | ToggleSwitch  | Alive/dead toggle                            |
| `Dialog`         | Dialog        | Role detail, join game, edit forms           |
| `Drawer`         | Drawer        | Mobile navigation                            |
| `Tabs`           | Tabs          | Leaderboard tabs                             |
| `Tab`            | Tab           | Individual tab headers                       |
| `TabList`        | TabList       | Tab header container                         |
| `TabPanels`      | TabPanels     | Tab content container                        |
| `TabPanel`       | TabPanel      | Individual tab content                       |
| `Chart`          | Chart         | Role distribution, win rate trend            |
| `Toast`          | Toast         | Notifications, success/error messages        |
| `ConfirmDialog`  | ConfirmDialog | Delete confirmations                         |
| `Skeleton`       | Skeleton      | Loading states for all page sections         |
| `Paginator`      | Paginator     | Mobile pagination (standalone)               |

## Appendix B: File Structure

```
components/
  AppHeader.vue
  AppFooter.vue
  RoleBadge.vue
  StatCard.vue
  InfoField.vue
  LeaderboardTable.vue
  game/
    GameInfoCard.vue
    GamePlayersTable.vue
    GamePlayersMobile.vue
    JoinGameDialog.vue
    GameForm.vue
    PlayerRow.vue
  role/
    RoleCard.vue
    RoleDetailDialog.vue
    RoleFilters.vue
  player/
    PlayerCard.vue
    PlayerStats.vue
    PlayerCharts.vue
    PlayerGameHistory.vue

composables/
  useRoleType.ts          # role color/class helpers
  useTheme.ts             # dark mode toggle
  useCountUp.ts           # number animation
  useAuth.ts              # auth state
  usePlayerSearch.ts      # autocomplete helper
  useRoleSearch.ts        # autocomplete helper

assets/
  css/
    main.css              # Tailwind + theme tokens
    role-tags.css          # Custom role type tag styles
    transitions.css        # Page + component transitions

pages/
  index.vue               # Home
  roles.vue               # Roles catalog
  games/
    index.vue             # Games list
    [id].vue              # Game detail
    new.vue               # Create game (admin)
  players/
    index.vue             # Players list
    [id].vue              # Player profile
  leaderboard.vue         # Leaderboard
```

## Appendix C: Icon Mapping

| Concept         | PrimeIcon              | Usage                    |
|-----------------|------------------------|--------------------------|
| Home            | `pi pi-home`           | Navigation               |
| Games           | `pi pi-list`           | Navigation               |
| Players         | `pi pi-users`          | Navigation               |
| Leaderboard     | `pi pi-trophy`         | Navigation               |
| Roles           | `pi pi-book`           | Navigation               |
| Good team       | `pi pi-sun`            | Alignment tags           |
| Evil team       | `pi pi-moon`           | Alignment tags           |
| Alive           | `pi pi-heart-fill`     | Status indicator         |
| Dead            | `pi pi-times`          | Status indicator         |
| MVP             | `pi pi-star-fill`      | MVP indicator            |
| Calendar        | `pi pi-calendar`       | Date fields              |
| Search          | `pi pi-search`         | Search inputs            |
| Add             | `pi pi-plus`           | Add actions              |
| Edit            | `pi pi-pencil`         | Edit actions             |
| Delete          | `pi pi-trash`          | Delete actions           |
| Settings        | `pi pi-cog`            | User menu                |
| Sign In         | `pi pi-sign-in`        | Auth button              |
| Sign Out        | `pi pi-sign-out`       | User menu                |
| Arrow Right     | `pi pi-arrow-right`    | "View more" links        |
| Chevron Right   | `pi pi-chevron-right`  | Table row navigation     |
| Chart           | `pi pi-chart-bar`      | Stats sections           |
| User            | `pi pi-user`           | Profile                  |
