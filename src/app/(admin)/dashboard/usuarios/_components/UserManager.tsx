'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import type { AuthUser } from '@/lib/api/auth'
import type { AdminUser } from '@/lib/api/users'
import { TempPasswordDisplay } from './TempPasswordDisplay'
import {
  createUserAction,
  deleteUserAction,
  resetPasswordAction,
  revokeSessionsAction,
  updateUserAction,
  type UserFormState,
} from '../_actions'

interface Props {
  initialUsers: AdminUser[]
  currentUser: AuthUser
}

interface UserRowProps {
  user: AdminUser
  currentUserId: string
  selected: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

interface UserEditorProps {
  selected: AdminUser | null
  currentUserId: string
  onCreate: () => void
}

const initialState: UserFormState = {}

const ROLE_LABEL: Record<AdminUser['role'], string> = {
  ADMIN: 'ADMIN',
  ARCHITECT: 'ARCHITECT',
}

const USER_GRID_CLASS = 'grid grid-cols-[minmax(0,1fr)_92px_88px_140px_132px] items-center gap-3'

function formatLastLogin(lastLoginAt: string | null): string {
  if (!lastLoginAt) return 'Nunca'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(lastLoginAt))
}

function fieldError(state: UserFormState, field: string) {
  return state.fieldErrors?.[field]
}

function generalError(state: UserFormState, knownFields: string[]) {
  if (state.error) return state.error
  const unknownErrors = Object.entries(state.fieldErrors ?? {})
    .filter(([field]) => !knownFields.includes(field))
    .map(([, message]) => message)
  return unknownErrors.length > 0 ? unknownErrors.join(' · ') : undefined
}

function RoleBadge({ role }: { role: AdminUser['role'] }) {
  const admin = role === 'ADMIN'
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs ${
        admin ? 'bg-primary text-white' : 'bg-muted/60 text-primary/70'
      }`}
    >
      {admin ? (
        <ShieldCheck size={12} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <UserRound size={12} strokeWidth={1.5} aria-hidden="true" />
      )}
      {ROLE_LABEL[role]}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`w-fit px-2 py-1 text-xs ${
        active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function UserRow({ user, currentUserId, selected, onEdit, onDelete }: UserRowProps) {
  const [resetState, resetAction, resetting] = useActionState(
    resetPasswordAction.bind(null, user.id),
    initialState
  )
  const [revokeState, revokeAction, revoking] = useActionState(
    revokeSessionsAction.bind(null, user.id),
    initialState
  )
  const [dismissedPassword, setDismissedPassword] = useState<string | null>(null)
  const isCurrentUser = user.id === currentUserId
  const rowError = generalError(resetState, []) ?? generalError(revokeState, [])
  const showTemporaryPassword =
    !!resetState.temporaryPassword && dismissedPassword !== resetState.temporaryPassword

  return (
    <article
      className={`bg-white transition-colors ${
        selected ? 'bg-primary/[0.025] shadow-[inset_3px_0_0_#222933]' : ''
      }`}
    >
      <div className={`${USER_GRID_CLASS} px-4 py-4`}>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="min-w-0 truncate font-medium">{user.name}</p>
            {isCurrentUser && (
              <span className="bg-primary/5 text-primary/55 shrink-0 px-2 py-0.5 text-[10px] tracking-[0.12em] uppercase">
                Voce
              </span>
            )}
          </div>
          <p className="text-primary/45 truncate text-xs">{user.email}</p>
        </div>

        <RoleBadge role={user.role} />
        <StatusBadge active={user.active} />
        <span className="text-primary/55 text-sm leading-snug">
          {formatLastLogin(user.lastLoginAt)}
        </span>

        <div className="flex justify-end gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(user.id)}
            aria-label={`Editar ${user.name}`}
            className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
          >
            <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>

          <form action={resetAction}>
            <button
              type="submit"
              disabled={resetting}
              aria-label={`Resetar senha de ${user.name}`}
              className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {resetting ? (
                <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <KeyRound size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </form>

          <form action={revokeAction}>
            <button
              type="submit"
              disabled={revoking}
              aria-label={`Revogar sessoes de ${user.name}`}
              className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {revoking ? (
                <LoaderCircle size={16} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </form>

          <button
            type="button"
            disabled={isCurrentUser}
            onClick={() => onDelete(user.id)}
            aria-label={`Remover ${user.name}`}
            title={isCurrentUser ? 'Voce nao pode remover a si mesmo' : undefined}
            className="text-primary/45 hover:bg-primary/5 hover:text-accent grid size-8 place-items-center transition-colors disabled:pointer-events-none disabled:opacity-25"
          >
            <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {(rowError || resetState.success || revokeState.success || resetState.temporaryPassword) && (
        <div className="grid gap-3 px-4 pb-4">
          {rowError && (
            <p className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm">
              {rowError}
            </p>
          )}
          {(resetState.success || revokeState.success) && (
            <p className="border-muted bg-surface border px-3 py-2 text-sm text-green-700">
              {resetState.success ?? revokeState.success}
            </p>
          )}
          {showTemporaryPassword && resetState.temporaryPassword && (
            <TempPasswordDisplay
              password={resetState.temporaryPassword}
              onDismiss={() => setDismissedPassword(resetState.temporaryPassword ?? null)}
            />
          )}
        </div>
      )}
    </article>
  )
}

function UserEditor({ selected, currentUserId, onCreate }: UserEditorProps) {
  const action = selected ? updateUserAction.bind(null, selected.id) : createUserAction
  const [state, formAction, pending] = useActionState(action, initialState)
  const [dismissedPassword, setDismissedPassword] = useState<string | null>(null)
  const isEditingSelf = selected?.id === currentUserId
  const error = generalError(state, [
    'name',
    'email',
    'role',
    'active',
    'temporaryPassword',
    'confirmTemporaryPassword',
  ])
  const showTemporaryPassword =
    !!state.temporaryPassword && dismissedPassword !== state.temporaryPassword

  return (
    <aside className="border-muted bg-surface border p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-primary/45 text-[11px] tracking-[0.2em] uppercase">
          {selected ? 'Editar usuario' : 'Novo usuario'}
        </p>
        {selected && (
          <button
            type="button"
            onClick={onCreate}
            aria-label="Cancelar edicao"
            className="text-primary/45 hover:text-primary transition-colors"
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>

      <form key={selected?.id ?? 'new'} action={formAction} className="grid gap-4">
        <div className="grid gap-1.5 text-sm">
          <label htmlFor="user-name">Nome *</label>
          <input
            id="user-name"
            name="name"
            defaultValue={selected?.name ?? ''}
            required
            aria-describedby={fieldError(state, 'name') ? 'user-name-error' : undefined}
            className={`h-10 border px-3 transition-colors outline-none ${
              fieldError(state, 'name')
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-muted focus:border-primary bg-white'
            }`}
          />
          {fieldError(state, 'name') && (
            <p id="user-name-error" className="text-xs text-red-600" role="alert">
              {fieldError(state, 'name')}
            </p>
          )}
        </div>

        <div className="grid gap-1.5 text-sm">
          <label htmlFor="user-email">E-mail *</label>
          <input
            id="user-email"
            name="email"
            type="email"
            defaultValue={selected?.email ?? ''}
            required
            aria-describedby={fieldError(state, 'email') ? 'user-email-error' : undefined}
            className={`h-10 border px-3 transition-colors outline-none ${
              fieldError(state, 'email')
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-muted focus:border-primary bg-white'
            }`}
          />
          {fieldError(state, 'email') && (
            <p id="user-email-error" className="text-xs text-red-600" role="alert">
              {fieldError(state, 'email')}
            </p>
          )}
        </div>

        <div className="grid gap-1.5 text-sm">
          <label htmlFor="user-role">Perfil *</label>
          <select
            id="user-role"
            name="role"
            defaultValue={selected?.role ?? 'ARCHITECT'}
            required
            aria-describedby={fieldError(state, 'role') ? 'user-role-error' : undefined}
            className={`h-10 border px-3 transition-colors outline-none ${
              fieldError(state, 'role')
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-muted focus:border-primary bg-white'
            }`}
          >
            <option value="ARCHITECT">ARCHITECT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          {fieldError(state, 'role') && (
            <p id="user-role-error" className="text-xs text-red-600" role="alert">
              {fieldError(state, 'role')}
            </p>
          )}
        </div>

        {selected && (
          <div className="grid gap-4">
            <div className="grid gap-2 text-sm">
              <input type="hidden" name="active" value="false" disabled={isEditingSelf} />
              {isEditingSelf && <input type="hidden" name="active" value="true" />}
              <label className="flex items-center gap-2">
                <input
                  name="active"
                  type="checkbox"
                  value="true"
                  defaultChecked={selected.active}
                  disabled={isEditingSelf}
                  className="accent-primary size-4"
                />
                Ativo
              </label>
              {isEditingSelf && (
                <p className="text-primary/45 text-xs">Seu proprio acesso permanece ativo.</p>
              )}
              {fieldError(state, 'active') && (
                <p className="text-xs text-red-600" role="alert">
                  {fieldError(state, 'active')}
                </p>
              )}
            </div>

            {!isEditingSelf ? (
              <div className="border-muted border-t pt-4">
                <p className="text-primary/45 mb-3 text-[10px] tracking-[0.16em] uppercase">
                  Senha manual
                </p>

                <div className="grid gap-4">
                  <div className="grid gap-1.5 text-sm">
                    <label htmlFor="edit-temporary-password">Nova senha opcional</label>
                    <input
                      id="edit-temporary-password"
                      name="temporaryPassword"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby={
                        fieldError(state, 'temporaryPassword')
                          ? 'edit-temporary-password-error'
                          : undefined
                      }
                      className={`h-10 border px-3 transition-colors outline-none ${
                        fieldError(state, 'temporaryPassword')
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : 'border-muted focus:border-primary bg-white'
                      }`}
                    />
                    {fieldError(state, 'temporaryPassword') ? (
                      <p
                        id="edit-temporary-password-error"
                        className="text-xs text-red-600"
                        role="alert"
                      >
                        {fieldError(state, 'temporaryPassword')}
                      </p>
                    ) : (
                      <p className="text-primary/45 text-xs">
                        Preencha apenas se quiser definir uma nova senha para este usuario.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-1.5 text-sm">
                    <label htmlFor="edit-confirm-temporary-password">Confirmar nova senha</label>
                    <input
                      id="edit-confirm-temporary-password"
                      name="confirmTemporaryPassword"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby={
                        fieldError(state, 'confirmTemporaryPassword')
                          ? 'edit-confirm-temporary-password-error'
                          : undefined
                      }
                      className={`h-10 border px-3 transition-colors outline-none ${
                        fieldError(state, 'confirmTemporaryPassword')
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : 'border-muted focus:border-primary bg-white'
                      }`}
                    />
                    {fieldError(state, 'confirmTemporaryPassword') && (
                      <p
                        id="edit-confirm-temporary-password-error"
                        className="text-xs text-red-600"
                        role="alert"
                      >
                        {fieldError(state, 'confirmTemporaryPassword')}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-primary/45 mt-3 text-xs">
                  Usuarios comuns alteram apenas a propria senha em Meu Perfil. Esta area e restrita
                  a admins.
                </p>
              </div>
            ) : (
              <div className="border-muted border-t pt-4">
                <p className="text-primary/45 text-xs">
                  Para alterar sua propria senha, use a tela Meu Perfil. Assim a senha atual e
                  validada antes da troca.
                </p>
              </div>
            )}
          </div>
        )}

        {!selected && (
          <div className="grid gap-4">
            <div className="grid gap-1.5 text-sm">
              <label htmlFor="temporary-password">Senha inicial opcional</label>
              <input
                id="temporary-password"
                name="temporaryPassword"
                type="password"
                autoComplete="new-password"
                aria-describedby={
                  fieldError(state, 'temporaryPassword') ? 'temporary-password-error' : undefined
                }
                className={`h-10 border px-3 transition-colors outline-none ${
                  fieldError(state, 'temporaryPassword')
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-muted focus:border-primary bg-white'
                }`}
              />
              {fieldError(state, 'temporaryPassword') ? (
                <p id="temporary-password-error" className="text-xs text-red-600" role="alert">
                  {fieldError(state, 'temporaryPassword')}
                </p>
              ) : (
                <p className="text-primary/45 text-xs">
                  Vazio gera uma senha forte automaticamente. Se preencher, use no minimo 12
                  caracteres com maiuscula, minuscula, numero e simbolo.
                </p>
              )}
            </div>

            <div className="grid gap-1.5 text-sm">
              <label htmlFor="confirm-temporary-password">Confirmar senha inicial</label>
              <input
                id="confirm-temporary-password"
                name="confirmTemporaryPassword"
                type="password"
                autoComplete="new-password"
                aria-describedby={
                  fieldError(state, 'confirmTemporaryPassword')
                    ? 'confirm-temporary-password-error'
                    : undefined
                }
                className={`h-10 border px-3 transition-colors outline-none ${
                  fieldError(state, 'confirmTemporaryPassword')
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-muted focus:border-primary bg-white'
                }`}
              />
              {fieldError(state, 'confirmTemporaryPassword') && (
                <p
                  id="confirm-temporary-password-error"
                  className="text-xs text-red-600"
                  role="alert"
                >
                  {fieldError(state, 'confirmTemporaryPassword')}
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm">
            {error}
          </p>
        )}

        {state.success && (
          <p className="border-muted border bg-white px-3 py-2 text-sm text-green-700">
            {state.success}
          </p>
        )}

        {showTemporaryPassword && state.temporaryPassword && (
          <TempPasswordDisplay
            password={state.temporaryPassword}
            onDismiss={() => setDismissedPassword(state.temporaryPassword ?? null)}
          />
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-primary hover:bg-accent mt-2 inline-flex h-10 items-center justify-center gap-2 px-4 text-sm text-white transition-colors disabled:pointer-events-none disabled:opacity-60"
        >
          {pending && (
            <LoaderCircle size={15} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
          )}
          {selected ? 'Salvar alteracoes' : 'Criar usuario'}
        </button>
      </form>
    </aside>
  )
}

export function UserManager({ initialUsers, currentUser }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<UserFormState>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const [users, setUsers] = useState(initialUsers)
  if (initialUsers.length !== users.length || initialUsers.some((u, i) => u.id !== users[i]?.id)) {
    setUsers(initialUsers)
  }

  const selected = users.find((user) => user.id === selectedId) ?? null

  function openCreate() {
    setSelectedId(null)
    setDeleteState({})
  }

  function openEdit(id: string) {
    setSelectedId(id)
    setDeleteState({})
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    setDeleteState({})
    startDelete(async () => {
      const result = await deleteUserAction(id)
      setDeleteState(result)
      setDeletingId(null)
      if (!result.error && !result.fieldErrors) {
        if (selectedId === id) setSelectedId(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="border-muted overflow-hidden border">
        <div
          className={`${USER_GRID_CLASS} border-muted bg-surface text-primary/45 border-b px-4 py-3 text-[10px] tracking-[0.16em] uppercase`}
        >
          <span>Usuario</span>
          <span>Perfil</span>
          <span>Status</span>
          <span>Ultimo login</span>
          <span className="text-right">Acoes</span>
        </div>

        {deleteState.error && (
          <p className="border-accent/30 bg-accent/5 text-accent m-4 border px-3 py-2 text-sm">
            {deleteState.error}
          </p>
        )}

        {users.length === 0 ? (
          <p className="text-primary/45 p-6 text-sm">Nenhum usuario cadastrado ainda.</p>
        ) : (
          <div className="divide-muted divide-y">
            {users.map((user) => (
              <div key={user.id} className="relative">
                {isDeleting && deletingId === user.id && (
                  <div className="absolute inset-0 z-10 grid place-items-center bg-white/70">
                    <LoaderCircle size={18} strokeWidth={1.5} className="animate-spin" />
                  </div>
                )}
                <UserRow
                  user={user}
                  currentUserId={currentUser.id}
                  selected={user.id === selectedId}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <UserEditor
        key={selected?.id ?? 'new'}
        selected={selected}
        currentUserId={currentUser.id}
        onCreate={openCreate}
      />

      <div className="flex justify-end xl:hidden">
        <button
          type="button"
          onClick={openCreate}
          className="bg-primary hover:bg-accent inline-flex h-10 items-center gap-2 px-4 text-sm text-white transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          Novo usuario
        </button>
      </div>
    </div>
  )
}
