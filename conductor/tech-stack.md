# Tech Stack

## Language
- **TypeScript** — strict mode, type safety throughout

## Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Nuxt** | 4 | SSR/SPA framework, file-based routing |
| **PrimeVue** | 4 (Aura theme) | UI component library (DataTable, AutoComplete, Dialog, Chart, etc.) |
| **Tailwind CSS** | 4 | Utility-first styling, custom BotC theme tokens |

## Backend / Database
| Technology | Purpose |
|-----------|---------|
| **Supabase** (PostgreSQL) | Database, free tier 500MB |
| **Supabase Auth** | Google OAuth, user management |
| **Supabase RLS** | Row Level Security for permission model |

## Linting & Formatting
| Tool | Config |
|------|--------|
| **@nuxt/eslint** | Flat config, includes stylistic formatting |
| No Prettier | Stylistic rules handled by ESLint |

### ESLint Rules
- `no-console: error`
- `semi: false`
- `quotes: single`
- `vue/max-len: warn (100)`

## Testing
| Level | Tool | Scope |
|-------|------|-------|
| **Unit** | Vitest | Composables, utilities, stat calculations |
| **Component** | Vitest + @vue/test-utils + @nuxt/test-utils | Component rendering, props, events |
| **E2E** | Playwright | Full user flows (create game, join, stats) |

## Deployment
| Option | Tier |
|--------|------|
| **Vercel** or **Cloudflare Pages** | Free tier, Nuxt SSR support |

## Key Dependencies
```
@primevue/nuxt-module
@primevue/themes
@nuxtjs/supabase
tailwindcss
@nuxt/eslint
vitest
@nuxt/test-utils
@vue/test-utils
happy-dom
@playwright/test
```

## External Data Source
- **Roles database**: [json-on-the-clocktower](https://github.com/chizmeeple/json-on-the-clocktower)
- URL: `https://raw.githubusercontent.com/chizmw/json-on-the-clocktower/main/data/generated/roles-combined.json`
- 178 roles (154 excluding meta), complete with abilities, teams, editions, night order, image URLs
