# Status: Usuários, Perfil e Visibilidade na Home

Atualizado em: 2026-05-03

## Resumo

O fluxo principal já foi implementado:

- [x] Aba **Usuários** no dashboard para administradores.
- [x] CRUD administrativo de usuários usando a API existente.
- [x] Criação e reset de senha com senha temporária visível uma única vez.
- [x] Proteção da rota `/dashboard/usuarios` para `ADMIN`.
- [x] Aba **Meu Perfil** para todos os usuários autenticados.
- [x] Alteração da própria senha em `/dashboard/perfil`.
- [x] Ajustes de criação/edição de projetos para erros por campo.
- [x] Correção da revalidação da home quando um projeto é destacado ou tem capa alterada.

---

## Backend

### Autenticação

- [x] Endpoint `POST /api/v1/auth/change-password` criado.
- [x] Endpoint protegido por autenticação.
- [x] Endpoint protegido por CSRF.
- [x] Validação de senha atual, nova senha e confirmação.
- [x] Hash da nova senha antes de salvar.
- [x] Cliente frontend expõe `changePassword` em `src/lib/api/auth.ts`.

Arquivos principais:

- [x] `backend/src/modules/auth/auth.router.ts`
- [x] `backend/src/modules/auth/auth.controller.ts`
- [x] `backend/src/modules/auth/auth.service.ts`
- [x] `backend/src/modules/auth/auth.schemas.ts`
- [x] `src/lib/api/auth.ts`

### Usuários Admin

O backend de usuários já existe e está integrado pelo frontend:

- [x] `GET /admin/users`
- [x] `POST /admin/users`
- [x] `GET /admin/users/:id`
- [x] `PATCH /admin/users/:id`
- [x] `DELETE /admin/users/:id`
- [x] `POST /admin/users/:id/reset-password`
- [x] `POST /admin/users/:id/revoke-sessions`
- [x] Regra `LAST_ACTIVE_ADMIN` protegendo o último admin ativo.
- [x] Senha temporária opcional na criação/reset; se vazia, o backend gera uma senha forte.

---

## Frontend

### API Client de Usuários

- [x] Criado `src/lib/api/users.ts`.
- [x] Tipos `AdminUser`, `CreateUserInput`, `UpdateUserInput`.
- [x] `getAdminUsers(params?)`
- [x] `getAdminUser(id)`
- [x] `createUser(data)`
- [x] `updateUser(id, data)`
- [x] `deleteUser(id)`
- [x] `resetUserPassword(id, temporaryPassword?)`
- [x] `revokeUserSessions(id)`

### Server Actions de Usuários

- [x] Criado `src/app/(admin)/dashboard/usuarios/_actions.ts`.
- [x] `createUserAction`
- [x] `updateUserAction`
- [x] `deleteUserAction`
- [x] `resetPasswordAction`
- [x] `revokeSessionsAction`
- [x] `UserFormState` com `error`, `fieldErrors`, `success` e `temporaryPassword`.
- [x] Tratamento de erros via `extractFormState`.
- [x] Mensagem amigável para `LAST_ACTIVE_ADMIN`.
- [x] `revalidatePath('/dashboard/usuarios')` após mutações.

### Página de Usuários

- [x] Criada rota `/dashboard/usuarios`.
- [x] Server Component carrega `getAuthUser()`.
- [x] Server Component bloqueia acesso de não-admin com redirect para `/dashboard`.
- [x] Server Component carrega `getAdminUsers()`.
- [x] Dados enviados para `UserManager`.

Arquivos:

- [x] `src/app/(admin)/dashboard/usuarios/page.tsx`
- [x] `src/app/(admin)/dashboard/usuarios/_components/UserManager.tsx`
- [x] `src/app/(admin)/dashboard/usuarios/_components/TempPasswordDisplay.tsx`

### Componente `UserManager`

- [x] Lista de usuários.
- [x] Nome e e-mail.
- [x] Badge de role.
- [x] Badge de status.
- [x] Último login.
- [x] Botão editar.
- [x] Botão resetar senha.
- [x] Botão revogar sessões.
- [x] Botão excluir.
- [x] Bloqueio visual para impedir ação destrutiva no próprio usuário.
- [x] Formulário de criação.
- [x] Formulário de edição.
- [x] Campo de senha inicial opcional na criação.
- [x] Campo de confirmação de senha inicial.
- [x] Campo de nova senha opcional na edição de outro usuário.
- [x] Campo de confirmação da nova senha.
- [x] Exibição de senha temporária após criação/reset.
- [x] Botão de copiar senha temporária.
- [x] Botão para ocultar senha temporária.

### Meu Perfil

- [x] Criada rota `/dashboard/perfil`.
- [x] Página exibe dados da conta autenticada.
- [x] Formulário para alterar a própria senha.
- [x] Validação de senha atual.
- [x] Validação de nova senha e confirmação.
- [x] Feedback de sucesso/erro no formulário.

Arquivos:

- [x] `src/app/(admin)/dashboard/perfil/page.tsx`
- [x] `src/app/(admin)/dashboard/perfil/_actions.ts`
- [x] `src/app/(admin)/dashboard/perfil/_components/ProfilePasswordForm.tsx`

### Navegação e Layout

- [x] `AdminNav` recebe `role`.
- [x] Item **Meu Perfil** aparece para todos os usuários autenticados.
- [x] Item **Usuários** aparece somente para `ADMIN`.
- [x] `dashboard/layout.tsx` passa `user.role` para `AdminNav`.

Arquivos:

- [x] `src/components/admin/AdminNav.tsx`
- [x] `src/app/(admin)/dashboard/layout.tsx`

---

## Projetos e Home

### Criação/Edição de Projetos

- [x] Criação de projeto trata erros por campo.
- [x] Campos opcionais vazios são limpos antes do envio.
- [x] Projeto criado redireciona para a tela de edição.
- [x] Mensagens de validação ficam mais amigáveis.

Arquivos:

- [x] `src/app/(admin)/dashboard/projetos/_actions.ts`
- [x] `src/app/(admin)/dashboard/projetos/_components/ProjectCreateForm.tsx`
- [x] `backend/src/modules/projects/projects.schemas.ts`

### Visibilidade na Home

- [x] Home busca projetos com `featured=true`.
- [x] Home usa `coverImage` como imagem principal do destaque.
- [x] Projeto precisa estar `PUBLISHED` para aparecer publicamente.
- [x] Salvar projeto revalida `/`.
- [x] Publicar/despublicar/excluir projeto revalida `/`.
- [x] Enviar/remover/reordenar imagem revalida `/`.
- [x] Helper global de revalidação de projeto também revalida `/`.

Arquivos:

- [x] `src/app/(public)/page.tsx`
- [x] `src/app/(admin)/dashboard/projetos/_actions.ts`
- [x] `src/lib/project-revalidation.ts`

---

## Casos de Borda

- [x] Tentar deletar/desativar o último admin ativo retorna mensagem clara.
- [x] Usuário não-admin não acessa `/dashboard/usuarios`.
- [x] Aba **Usuários** não aparece para não-admin.
- [x] Senha temporária aparece após criar/resetar.
- [x] Senha temporária pode ser copiada.
- [x] Usuário atual não deve ser alvo de ações destrutivas no painel de usuários.
- [x] E-mail duplicado é tratado como erro de campo.
- [x] Checkbox **Destaque na home** só afeta a home depois de salvar o projeto.
- [x] Projeto destacado só aparece na home se também estiver publicado e tiver capa.

---

## Falta Fazer

### Obrigatório antes de considerar 100% fechado

- [x] Fazer QA manual/automatizado no navegador/SSR com um usuário `ADMIN`:
  - abrir `/dashboard/usuarios`;
  - criar usuário com senha automática;
  - criar usuário com senha manual;
  - editar nome/e-mail/role/status;
  - resetar senha;
  - revogar sessões;
  - excluir usuário.
- [x] Fazer QA manual/automatizado no navegador/SSR com um usuário `ARCHITECT`:
  - confirmar que a aba **Usuários** não aparece;
  - tentar acessar `/dashboard/usuarios` diretamente;
  - confirmar redirect para `/dashboard`.
- [x] Fazer QA manual/automatizado em `/dashboard/perfil`:
  - alterar senha com senha atual correta;
  - testar erro com senha atual incorreta;
  - testar erro com confirmação divergente.
- [x] Testar no navegador/API o fluxo de projeto destacado:
  - marcar **Destaque na home**;
  - salvar alterações;
  - publicar o projeto;
  - trocar foto de capa;
  - confirmar que a imagem aparece na home.

### Recomendado

- [x] Adicionar testes automatizados para `change-password`.
- [x] Executar QA automatizado dos fluxos cobertos pelas server actions de usuários.
- [x] Executar testes de UI/SSR para permissões `ADMIN` versus `ARCHITECT`.
- [x] Revisar se `public/uploads/` deve mesmo ser versionado no Git ou se deve virar armazenamento externo/ignorado.
- [x] Ignorar `.codex-logs/`, que é apenas log local de execução.
- [x] Rodar `npm run lint` e `npm run typecheck` novamente antes do próximo deploy.

### Resultado da execução em 2026-05-03

- [x] QA local executado com 28 checks passando:
  - usuário `ADMIN` abriu `/dashboard/usuarios`;
  - usuário `ADMIN` criou usuário com senha automática;
  - usuário `ADMIN` criou usuário com senha manual;
  - usuário `ADMIN` editou nome/e-mail/role/status;
  - usuário `ADMIN` resetou senha;
  - usuário `ADMIN` revogou sessões;
  - usuário `ADMIN` excluiu usuário;
  - usuário `ARCHITECT` abriu `/dashboard`;
  - usuário `ARCHITECT` não viu a aba **Usuários**;
  - usuário `ARCHITECT` foi redirecionado ao acessar `/dashboard/usuarios`;
  - `/dashboard/perfil` rejeitou senha atual incorreta;
  - `/dashboard/perfil` rejeitou confirmação divergente;
  - `/dashboard/perfil` alterou senha com senha atual correta;
  - home renderizou capa destacada;
  - `featured=false` removeu projeto da lista pública de destaque;
  - `featured=true` recolocou projeto na lista pública de destaque;
  - troca de capa refletiu na API pública;
  - capa original foi restaurada.
- [x] Testes backend executados com `npm run test:run`: 64 testes passando.
- [x] Validações executadas:
  - `npm run lint` na raiz;
  - `npm run typecheck` na raiz;
  - `npm run lint` no backend;
  - `npm run typecheck` no backend;
  - `npx prettier --check idea.md backend/src/tests/unit/auth.service.test.ts`.
- [x] Decisão sobre `public/uploads/`: manter versionado por enquanto, pois o ambiente local usa fallback de upload em disco e o banco possui projetos/equipe referenciando esses arquivos.
- [x] `.codex-logs/` adicionado ao `.gitignore`. Os arquivos locais podem permanecer enquanto front/backend estiverem rodando porque os processos mantêm os logs abertos, mas não aparecem mais no `git status`.

### Pendências restantes

- [x] Nenhuma pendência obrigatória restante.
- [x] Nenhuma pendência recomendada restante nesta checklist.

### Sem pendência de implementação conhecida

- [x] Não há pendência de código conhecida para a aba **Usuários**.
- [x] Não há pendência de código conhecida para **Meu Perfil**.
- [x] Não há pendência de código conhecida para a correção de **Destaque na home**.
