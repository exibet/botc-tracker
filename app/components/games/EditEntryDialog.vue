<script setup lang="ts">
import type { Role, RoleType, Alignment } from '~/types'
import type { GamePlayerWithDetails }
  from '~/composables/useGamePlayers'
import {
  getRoleTypeInfo,
  getRoleTypeTagClass,
  getAlignmentForRoleType,
} from '~/composables/useRoleTypes'
import RolePickerPanel
  from '~/components/games/RolePickerPanel.vue'
import RoleAvatar from '~/components/games/RoleAvatar.vue'
import AlignmentTag from '~/components/games/AlignmentTag.vue'

const props = defineProps<{
  visible: boolean
  entry: GamePlayerWithDetails | null
  roles: Role[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'updated': [data: {
    id: string
    starting_role_id: string
    ending_role_id: string | null
    alignment_start: Alignment
    alignment_end: Alignment | null
    is_alive: boolean
  }]
}>()

const alignmentFromType = getAlignmentForRoleType

// --- State ---
const selectedRole = ref<Role | null>(null)
const alignmentValue = ref<Alignment>('good')
const alignmentManual = ref(false)
const isAlive = ref(true)
const saving = ref(false)
const endingRole = ref<Role | null>(null)
const showEndingRole = ref(false)
const activePicker = ref<'starting' | 'ending' | null>(null)

// --- Computed ---
const activeRole = computed(() =>
  showEndingRole.value && endingRole.value
    ? endingRole.value
    : selectedRole.value,
)

const derivedAlignment = computed<Alignment | null>(() =>
  activeRole.value
    ? alignmentFromType(activeRole.value.type)
    : null,
)

const alignment = computed<Alignment>(() =>
  alignmentManual.value
    ? alignmentValue.value
    : derivedAlignment.value ?? alignmentValue.value,
)

const isAutoAlignment = computed(() =>
  !alignmentManual.value && derivedAlignment.value !== null,
)

const canSubmit = computed(() =>
  !!selectedRole.value
  && (!showEndingRole.value || !!endingRole.value)
  && !saving.value,
)

// --- Helpers ---
function setAlignmentFromRole(role: Role) {
  const derived = alignmentFromType(role.type)
  if (derived) {
    alignmentValue.value = derived
    alignmentManual.value = false
  }
}

function roleTypeLabel(type: string): string {
  return getRoleTypeInfo(type)?.label ?? type
}

// --- Init from entry ---
watch(() => props.entry, (entry) => {
  if (!entry) return

  selectedRole.value = props.roles.find(
    r => r.id === entry.starting_role.id,
  ) ?? null

  const effectiveAlignment = entry.alignment_end
    ?? entry.alignment_start
  alignmentValue.value = effectiveAlignment

  const finalRole = (
    entry.ending_role
    && entry.ending_role.id !== entry.starting_role.id
  )
    ? entry.ending_role
    : entry.starting_role
  const derived = alignmentFromType(
    finalRole.type as RoleType,
  )
  alignmentManual.value = derived !== null
    && effectiveAlignment !== derived

  isAlive.value = entry.is_alive

  if (
    entry.ending_role
    && entry.ending_role.id !== entry.starting_role.id
  ) {
    showEndingRole.value = true
    endingRole.value = props.roles.find(
      r => r.id === entry.ending_role!.id,
    ) ?? null
  }
  else {
    showEndingRole.value = false
    endingRole.value = null
  }

  activePicker.value = null
}, { immediate: true })

watch(() => props.visible, (val) => {
  if (!val) {
    saving.value = false
    activePicker.value = null
  }
})

// --- Handlers ---
function handlePickerSelect(role: Role) {
  if (activePicker.value === 'starting') {
    selectedRole.value = role
  }
  else if (activePicker.value === 'ending') {
    endingRole.value = role
  }
  setAlignmentFromRole(role)
  activePicker.value = null
}

function addEndingRole() {
  showEndingRole.value = true
  activePicker.value = 'ending'
}

function removeEndingRole() {
  showEndingRole.value = false
  endingRole.value = null
  activePicker.value = null
  if (selectedRole.value) {
    setAlignmentFromRole(selectedRole.value)
  }
}

function toggleAlignment() {
  alignmentManual.value = true
  alignmentValue.value = alignment.value === 'good'
    ? 'evil'
    : 'good'
}

function handleSubmit() {
  if (!selectedRole.value || !props.entry) return
  saving.value = true

  const startAlign = alignmentFromType(selectedRole.value.type)
    ?? alignmentValue.value
  const alignmentChanged = alignment.value !== startAlign

  emit('updated', {
    id: props.entry.id,
    starting_role_id: selectedRole.value.id,
    ending_role_id: showEndingRole.value && endingRole.value
      ? endingRole.value.id
      : null,
    alignment_start: startAlign,
    alignment_end: alignmentChanged
      ? alignment.value
      : null,
    is_alive: isAlive.value,
  })
}

function handleHide() {
  emit('update:visible', false)
  saving.value = false
  activePicker.value = null
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :dismissable-mask="true"
    header="Редагувати запис"
    class="w-full max-w-lg sm:!h-auto"
    :breakpoints="{ '640px': '100vw' }"
    :pt="{
      root: {
        class: 'max-sm:!h-full max-sm:!max-h-full max-sm:!rounded-none max-sm:!m-0',
      },
      content: {
        class: 'max-sm:!flex-1 max-sm:!overflow-y-auto',
      },
    }"
    @update:visible="handleHide"
  >
    <div class="flex flex-col gap-4">
      <!-- ========== ROLE ========== -->
      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-semibold uppercase
            tracking-wider text-text-subtle"
        >
          Роль
        </label>

        <!-- Picker (replaces rows when open) -->
        <template v-if="activePicker !== null">
          <div class="flex flex-col gap-2">
            <div
              class="flex items-center justify-between
                rounded-lg bg-white/[0.04] px-3 py-2"
            >
              <span
                class="text-sm font-medium text-text-muted"
              >
                {{
                  activePicker === 'starting'
                    ? 'Оберіть початкову роль'
                    : 'Оберіть кінцеву роль'
                }}
              </span>
              <Button
                label="Готово"
                severity="secondary"
                text
                size="small"
                @click="activePicker = null"
              />
            </div>
            <RolePickerPanel
              :roles="roles"
              :selected-id="
                activePicker === 'starting'
                  ? (selectedRole?.id ?? null)
                  : (endingRole?.id ?? null)
              "
              compact
              @select="handlePickerSelect"
            />
          </div>
        </template>

        <!-- Role rows -->
        <template v-else>
          <!-- Starting role -->
          <div
            v-if="selectedRole"
            class="flex items-center gap-2"
          >
            <button
              type="button"
              class="role-row flex-1"
              @click="activePicker = 'starting'"
            >
              <RoleAvatar
                :image-url="selectedRole.image_url"
                :name="selectedRole.name_ua"
                :type="selectedRole.type"
                size="md"
              />
              <span
                class="min-w-0 flex-1 truncate text-sm
                  font-medium text-text"
              >
                {{ selectedRole.name_ua }}
              </span>
              <Tag
                :value="roleTypeLabel(selectedRole.type)"
                :class="getRoleTypeTagClass(
                  selectedRole.type,
                )"
                rounded
                class="!px-1.5 !py-0 !text-[10px]"
              />
            </button>
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              text
              rounded
              @click="activePicker = 'starting'"
            />
          </div>

          <!-- Ending role -->
          <template v-if="showEndingRole">
            <div class="flex justify-center pr-10">
              <i
                class="pi pi-arrow-down text-xs
                  text-text-subtle"
              />
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="endingRole"
                type="button"
                class="role-row flex-1"
                @click="activePicker = 'ending'"
              >
                <RoleAvatar
                  :image-url="endingRole.image_url"
                  :name="endingRole.name_ua"
                  :type="endingRole.type"
                  size="md"
                />
                <span
                  class="min-w-0 flex-1 truncate text-sm
                    font-medium text-text"
                >
                  {{ endingRole.name_ua }}
                </span>
                <Tag
                  :value="roleTypeLabel(endingRole.type)"
                  :class="getRoleTypeTagClass(
                    endingRole.type,
                  )"
                  rounded
                  class="!px-1.5 !py-0 !text-[10px]"
                />
              </button>

              <button
                v-else
                type="button"
                class="role-row flex-1 justify-center
                  !border-dashed !border-white/[0.12]
                  text-text-muted"
                @click="activePicker = 'ending'"
              >
                <i class="pi pi-plus text-xs" />
                <span class="text-sm">
                  Обрати кінцеву роль
                </span>
              </button>

              <Button
                icon="pi pi-times"
                severity="secondary"
                text
                rounded
                @click="removeEndingRole"
              />
            </div>
          </template>

          <div
            v-if="!showEndingRole"
            class="mt-1"
          >
            <Button
              label="Роль змінилась?"
              icon="pi pi-replay"
              severity="secondary"
              outlined
              size="small"
              @click="addEndingRole"
            />
          </div>
        </template>
      </div>

      <!-- ========== ALIGNMENT ========== -->
      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-semibold uppercase
            tracking-wider text-text-subtle"
        >
          Бік
        </label>

        <div class="flex items-center gap-2">
          <div
            class="flex min-w-0 flex-1 items-center gap-3
              rounded-xl border border-white/[0.08]
              bg-white/[0.04] px-3 py-2.5"
          >
            <AlignmentTag :alignment="alignment" />
            <span
              v-if="isAutoAlignment"
              class="text-xs text-text-subtle"
            >
              визначено з ролі
            </span>
          </div>
          <Button
            icon="pi pi-sync"
            severity="secondary"
            text
            rounded
            @click="toggleAlignment"
          />
        </div>
      </div>

      <!-- ========== STATUS ========== -->
      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-semibold uppercase
            tracking-wider text-text-subtle"
        >
          Статус
        </label>
        <div class="flex gap-1.5">
          <button
            type="button"
            class="status-btn"
            :class="isAlive ? 'status-alive' : ''"
            @click="isAlive = true"
          >
            Живий
          </button>
          <button
            type="button"
            class="status-btn"
            :class="!isAlive ? 'status-dead' : ''"
            @click="isAlive = false"
          >
            Мертвий
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Скасувати"
          severity="secondary"
          text
          @click="handleHide"
        />
        <Button
          label="Зберегти"
          icon="pi pi-check"
          :disabled="!canSubmit"
          :loading="saving"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.role-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255 255 255 / 0.08);
  background: rgba(255 255 255 / 0.04);
  padding: 0.625rem 0.75rem;
  text-align: left;
  transition: all 0.15s;
  cursor: pointer;
}

.role-row:hover {
  border-color: rgba(255 255 255 / 0.15);
  background: rgba(255 255 255 / 0.07);
}

.status-btn {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid rgba(255 255 255 / 0.08);
  background: rgba(255 255 255 / 0.04);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.status-btn:hover {
  background: rgba(255 255 255 / 0.07);
  border-color: rgba(255 255 255 / 0.15);
}

.status-btn.status-alive {
  background: color-mix(
    in srgb, var(--color-alive) 15%, transparent
  );
  border-color: color-mix(
    in srgb, var(--color-alive) 30%, transparent
  );
  color: var(--color-alive);
}

.status-btn.status-dead {
  background: color-mix(
    in srgb, var(--botc-red-400) 15%, transparent
  );
  border-color: color-mix(
    in srgb, var(--botc-red-400) 30%, transparent
  );
  color: var(--botc-red-400);
}
</style>
