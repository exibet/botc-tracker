# Workflow

## TDD Policy
**Moderate** — тести для composables та ключових компонентів, E2E для основних сценаріїв.

### What Gets Tested
| Category | Required | Examples |
|----------|----------|---------|
| Composables | Yes | `useAuth`, `useRoles`, `useGames`, `useLeaderboard` |
| Utility functions | Yes | Stat calculations, data transforms |
| Key components | Yes | `RoleCard`, `RoleFilter`, `GameCard`, `PlayerStats` |
| Page components | No | Covered by E2E |
| E2E flows | Yes | Role catalog, game flow, player profile, auth |

### Test Workflow
1. Write implementation
2. Write unit tests for logic (composables, utils)
3. Write component tests for key UI components
4. Write E2E tests for critical user flows
5. All tests must pass before phase completion

## Commit Strategy
**Conventional Commits**: `<type>(<scope>): <description>`

### Types
| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, config |
| `test` | Adding/updating tests |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `docs` | Documentation |

### Rules
- Type lowercase, description lowercase
- Max 72 chars for summary line
- Scope optional but encouraged (e.g., `feat(roles): add filter by edition`)

## Code Review
- Self-review OK for this project (solo/small team)
- Review generated code before committing

## Verification Checkpoints
**After each phase completion:**

1. All existing tests pass (`npm run test:run`)
2. Lint check passes (`npm run lint:check`)
3. Type check passes (`npm run typecheck`)
4. Manual verification of new functionality
5. Commit with descriptive message

## Task Lifecycle
1. **Pending** — task created, not started
2. **In Progress** — actively working
3. **Testing** — writing/running tests
4. **Verification** — manual check
5. **Complete** — done, committed

## Branch Strategy
- `main` — production-ready code
- Feature branches for tracks: `track/<track-id>`
- Merge to main after track completion
