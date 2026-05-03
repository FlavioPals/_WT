# Plano: Aba "Usuários" no Dashboard

## Contexto

O backend já possui o módulo de usuários **completo** (`/api/v1/admin/users`).
Todos os endpoints existem e estão protegidos por `requireRole(ADMIN)`.
O trabalho é **exclusivamente frontend**.

---

## O que o backend já entrega

| Endpoint                                | Descrição                                                       |
| --------------------------------------- | --------------------------------------------------------------- |
| `GET /admin/users`                      | Lista com filtros (q, role, active, deleted, page, limit, sort) |
| `POST /admin/users`                     | Cria usuário — retorna `{ user, temporaryPassword }`            |
| `GET /admin/users/:id`                  | Busca por ID                                                    |
| `PATCH /admin/users/:id`                | Atualiza nome, e-mail, role, active                             |
| `DELETE /admin/users/:id`               | Soft-delete (seta `active=false`, `deletedAt`, revoga sessões)  |
| `POST /admin/users/:id/reset-password`  | Gera nova senha temporária e revoga sessões                     |
| `POST /admin/users/:id/revoke-sessions` | Revoga todos os refresh tokens do usuário                       |

**Roles disponíveis:** `ADMIN` | `ARCHITECT`

**Regra de segurança:** só usuários com `role === 'ADMIN'` acessam esses endpoints.
O último admin ativo não pode ser deletado nem desativado (o backend protege isso com erro `LAST_ACTIVE_ADMIN`).

---

## Passo a passo — Frontend

### [x] PASSO 1 — API client (`src/lib/api/users.ts`)

Criar o arquivo com as funções que chamam os endpoints via `adminGet` / `adminMutate`.

```ts
// Tipos
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'ARCHITECT'
  active: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateUserInput {
  email
  name
  role
  temporaryPassword?
}
export interface UpdateUserInput {
  email?
  name?
  role?
  active?
}
```

Funções:

- `getAdminUsers(params?)` → lista paginada
- `getAdminUser(id)` → busca individual
- `createUser(data)` → retorna `{ user, temporaryPassword }`
- `updateUser(id, data)` → retorna `AdminUser`
- `deleteUser(id)` → void
- `resetUserPassword(id, temporaryPassword?)` → retorna `{ user, temporaryPassword }`
- `revokeUserSessions(id)` → retorna `{ revokedSessions: number }`

---

### [x] PASSO 2 — Server Actions (`src/app/(admin)/dashboard/usuarios/_actions.ts`)

Arquivo `'use server'` com:

```ts
export interface UserFormState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: string
  temporaryPassword?: string // exposto após criação ou reset
}
```

Actions:

- `createUserAction(_state, formData)` — retorna `{ success, temporaryPassword }`
- `updateUserAction(id, _state, formData)` — retorna `{ success }` ou `{ fieldErrors }`
- `deleteUserAction(id)` — soft-delete, void
- `resetPasswordAction(id, _state, formData)` — retorna `{ success, temporaryPassword }`
- `revokeSessionsAction(id)` — retorna `{ success }`

Todos os erros passam por `extractFormState(err)` igual ao padrão dos outros módulos.
Chamar `revalidatePath('/dashboard/usuarios')` após mutações.

---

### [x] PASSO 3 — Página principal (`src/app/(admin)/dashboard/usuarios/page.tsx`)

Server Component. Faz `getAdminUsers()` e passa para o `UserManager` client component.

Verificar se o usuário logado tem `role === 'ADMIN'`; caso contrário, redirecionar (`notFound()` ou `redirect('/dashboard')`).

---

### [x] PASSO 4 — Componente principal (`_components/UserManager.tsx`)

Client Component. Layout em duas colunas (igual ao `TeamManager`):

- Coluna esquerda: tabela/lista de usuários
- Coluna direita: painel de criação/edição

**Lista de usuários** (coluna esquerda):

- Nome + e-mail
- Badge de role (`ADMIN` / `ARCHITECT`) com cor diferente
- Badge de status (`Ativo` / `Inativo`)
- Data do último login (ou "Nunca")
- Botões de ação: editar, resetar senha, revogar sessões, excluir
- Usuário logado não pode deletar/desativar a si mesmo (desabilitar botão)

**Painel de criação/edição** (coluna direita):

- Campos: Nome _, E-mail _, Role (select), Ativo (checkbox — só no modo edição)
- Estado `Novo usuário` / `Editar usuário`
- Botão "Criar usuário" / "Salvar alterações"

**Modal/inline de senha temporária:**

- Após criar ou resetar senha, exibir a senha gerada com botão "Copiar"
- Avisar que a senha é mostrada **uma única vez**
- Campo de texto com a senha + botão de copiar para área de transferência

---

### [x] PASSO 5 — Componente de senha temporária (`_components/TempPasswordDisplay.tsx`)

```tsx
interface Props {
  password: string
  onDismiss: () => void
}
```

- Caixa destacada (borda amarela/âmbar) com aviso "Salve esta senha agora"
- Input readonly com a senha + botão de copiar (usa `navigator.clipboard.writeText`)
- Botão "Entendido" para fechar

---

### [x] PASSO 6 — Navegação (`src/components/admin/AdminNav.tsx`)

Adicionar item:

```ts
{ label: 'Usuários', href: '/dashboard/usuarios', icon: UserCog }
```

**Atenção:** este item deve ser renderizado **somente para usuários com `role === 'ADMIN'`**.
Para isso, o `AdminNav` precisa receber o `role` do usuário via props (passado pelo `layout.tsx` do dashboard que já busca `getAuthUser()`).

---

### [x] PASSO 7 — Proteção de rota no layout

Em `src/app/(admin)/dashboard/layout.tsx`, já existe `getAuthUser()`.
Passar `user.role` para `AdminNav` e para o layout, de modo que:

- A aba "Usuários" só aparece no menu para `ADMIN`
- A página `/dashboard/usuarios` redireciona para `/dashboard` se o role não for `ADMIN`

---

### [x] AJUSTE SOLICITADO — Meu Perfil e senha própria

- Criada página `/dashboard/perfil` no estilo da referência enviada, com informações da conta e formulário de alteração de senha.
- Adicionado endpoint autenticado `POST /api/v1/auth/change-password`, protegido por CSRF, para o próprio usuário alterar a senha informando senha atual, nova senha e confirmação.
- Adicionado item "Meu Perfil" no menu do dashboard para todos os usuários autenticados.
- Cadastro de usuário atualizado para permitir definir senha inicial e confirmar senha; se ficar vazio, o backend continua gerando uma senha forte automaticamente.
- Corrigido layout da lista de usuários para evitar scroll horizontal e contorno quebrado ao editar o próprio usuário.
- Edição de usuário atualizada para permitir que admins definam manualmente uma nova senha e confirmação para outros usuários no painel lateral; a própria senha é alterada somente em `/dashboard/perfil`.
- Criação de projeto ajustada para exibir erros de validação por campo em vez de "Invalid input" genérico; payload limpa campos opcionais vazios e redireciona para a edição do projeto criado.

---

## Ordem de implementação recomendada

```
1. src/lib/api/users.ts                          — tipos e funções de API
2. src/app/(admin)/dashboard/usuarios/_actions.ts — server actions
3. src/app/(admin)/dashboard/usuarios/page.tsx    — página (server component)
4. _components/TempPasswordDisplay.tsx            — componente de senha
5. _components/UserManager.tsx                    — componente principal
6. src/components/admin/AdminNav.tsx              — adicionar aba
7. src/app/(admin)/dashboard/layout.tsx           — passar role para AdminNav
```

---

## Casos de borda a considerar

| Situação                                                   | Comportamento esperado                                            |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Tentar deletar o último admin ativo                        | Backend retorna `LAST_ACTIVE_ADMIN` → exibir mensagem clara       |
| Tentar desativar o próprio usuário                         | Desabilitar o botão no front (comparar ID com `getAuthUser().id`) |
| Senha temporária gerada                                    | Exibir `TempPasswordDisplay` — mostrada **uma única vez**         |
| Role insuficiente (ARCHITECT acessa `/dashboard/usuarios`) | Redirecionar no `page.tsx` antes de renderizar qualquer dado      |
| E-mail duplicado                                           | Backend retorna `CONFLICT` → exibir erro no campo e-mail          |

---

## O que NÃO precisa ser feito

- **Backend:** módulo completo já existe e está em produção
- **Migrations:** schema já tem `active`, `deletedAt`, `lastLoginAt`, `RefreshToken`
- **Auth/CSRF:** já tratado pelo `adminMutate` padrão
