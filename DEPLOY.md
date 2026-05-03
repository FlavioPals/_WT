# Deploy — Studio WT Portfolio

Guia operacional para colocar o site em produção.

## Resumo operacional deste deploy

Este repositorio e publico. Nao versionar senhas, tokens, URLs reais de banco, service IDs, project refs privados, chaves de API, nem dominios temporarios que nao devem ser divulgados. Use sempre placeholders nos docs e mantenha valores reais somente nos painéis dos provedores ou em arquivos `.env` ignorados pelo Git.

O deploy preparado neste projeto usa:

- **Frontend**: Vercel, com o projeto apontando para a raiz do repo (`/`).
- **Backend**: Render Web Service, com `Root Directory` em `backend`, branch `main`, Node 20 e start via `npm run deploy:start`.
- **Banco**: Supabase Postgres via **Session Pooler**, nao via direct host `db.<PROJECT_REF>.supabase.co`, porque Render Free pode nao conseguir acessar IPv6.
- **Migrations**: `backend/src/scripts/deploy-start.ts` so roda migrations se `RUN_MIGRATIONS_ON_START=true`; o comando separado fica em `backend/src/scripts/deploy-migrate.ts`.
- **Seed do admin**: `backend/prisma/seed.ts`; rode somente com variaveis reais fora do Git.

Arquivos importantes para entender o deploy na proxima manutencao:

| Tema                     | Arquivo/local                                                 |
| ------------------------ | ------------------------------------------------------------- |
| Variaveis do frontend    | `.env.example`                                                |
| Variaveis do backend     | `backend/.env.example` e `backend/src/config/env.ts`          |
| CORS do backend          | `backend/src/app.ts` (`FRONTEND_URL`)                         |
| Start de producao        | `backend/src/scripts/deploy-start.ts`                         |
| Migrations de deploy     | `backend/src/scripts/deploy-migrate.ts`                       |
| Schema e migrations      | `backend/prisma/schema.prisma` e `backend/prisma/migrations/` |
| Seed inicial             | `backend/prisma/seed.ts`                                      |
| Cliente HTTP do frontend | `src/lib/api-client.ts`                                       |

Topologia recomendada:

```
Vercel (frontend Next.js)  →  Provedor X (backend Express)  →  Postgres gerenciado (Supabase/Neon)
                                              │
                                              └→  Cloudinary (mídia)
```

Frontend e backend rodam **separados** e em **domínios diferentes** (ex.: `studiowt.com.br` e `api.studiowt.com.br`).

---

## 1. Pré-requisitos

- Domínio registrado.
- Conta Cloudinary com credenciais reais.
- Postgres gerenciado: **Supabase**, **Neon** ou **Railway** (qualquer um serve — todos oferecem free tier).
- Conta no provedor de backend escolhido: **Render**, **Railway** ou **Fly.io**.
- Conta na **Vercel** para o frontend.
- (Opcional) Conta no **Resend** para envio de e-mail do formulário de contato.

---

## 2. Postgres em produção

1. Crie o banco no provedor escolhido.
2. Pegue a `DATABASE_URL` no formato:

   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```

   - Supabase: use **Session Pooler** quando o backend estiver no Render Free ou em outro provedor sem IPv6.
   - Neon: `Connection Details → Pooled connection`.

3. Anote essa URL. Vai entrar como variável de ambiente do backend.

Template seguro para Supabase Session Pooler:

```env
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<DB_PASSWORD>@<POOLER_HOST>:5432/postgres?sslmode=require
```

Sinais de que a URL esta correta para Render Free:

- O usuario tem o formato `postgres.<PROJECT_REF>`.
- O host termina com `.pooler.supabase.com`.
- A URL termina com `?sslmode=require`.
- A senha real substitui `<DB_PASSWORD>` somente no painel do Render, nunca no Git.

> Em Render Free + Supabase, evite a direct connection `db.<PROJECT_REF>.supabase.co:5432`, pois ela pode resolver apenas IPv6 e deixar o backend sem conexao com o banco.

---

## 3. Cloudinary

1. Crie a conta e pegue:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Defina uma pasta dedicada no nome do projeto, ex.: `arquitetos-portfolio` (variável `CLOUDINARY_FOLDER`).
3. (Opcional) Defina presets de upload e auto-upload mappings se quiser regras adicionais.

---

## 4. Deploy do backend (`/backend`)

A escolha do provedor é indiferente — abaixo o passo a passo para os três mais comuns. Em todos, **publique apenas a pasta `backend/`** (configure o `Root Directory`).

### Variáveis de ambiente obrigatórias

```env
NODE_ENV=production
PORT=4000                       # provedor pode sobrescrever via $PORT
LOG_LEVEL=info
API_URL=https://api.seudominio.com
FRONTEND_URL=https://www.seudominio.com

DATABASE_URL=postgresql://...

JWT_ACCESS_SECRET=<32+ chars aleatórios>
JWT_REFRESH_SECRET=<32+ chars aleatórios>
COOKIE_SECRET=<32+ chars aleatórios>
CSRF_SECRET=<32+ chars aleatórios>

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=arquitetos-portfolio

ADMIN_EMAIL=admin@seudominio.com
ADMIN_NAME=Studio WT Admin
ADMIN_PASSWORD=<senha-forte-inicial>

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
CONTACT_RATE_LIMIT_MAX=5
UPLOAD_MAX_FILE_SIZE_MB=8

# Opcional — formulário de contato
RESEND_API_KEY=re_xxx
CONTACT_FROM_EMAIL=site@seudominio.com
CONTACT_TO_EMAIL=contato@seudominio.com
CONTACT_SUBJECT_PREFIX=[Studio WT] Novo contato
```

Gere os 4 segredos com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Comandos do build/run

| Etapa        | Comando                                                |
| ------------ | ------------------------------------------------------ |
| Install      | `npm ci --include=dev`                                 |
| Build        | `npx prisma generate && npm run build`                 |
| Start        | `npm run deploy:start`                                 |
| Migrations   | `npm run deploy:migrate`                               |
| Health probe | `GET /api/v1/health`                                   |
| Ready probe  | `GET /api/v1/ready` (usa para readiness — testa banco) |

> O start de producao nao roda migrations por padrao. Isso evita loop de boot quando o banco esta com credenciais, DNS ou rede incorretos. Para rodar migrations no start, defina `RUN_MIGRATIONS_ON_START=true` temporariamente.

> Se o provedor tiver Shell/one-off job, prefira rodar `npm run deploy:migrate` fora do start. No Render Free, Shell e jobs nao estao disponiveis; nesse caso use `RUN_MIGRATIONS_ON_START=true` para o primeiro deploy ou para deploys com nova migration, e remova/coloque `false` depois que o deploy ficar verde.

### Render

1. New → Web Service → conecte o repo.
2. Root Directory: `backend`.
3. Build Command: `npm ci --include=dev && npx prisma generate && npm run build`
4. Start Command: `npm run deploy:start`
5. Health Check Path: `/api/v1/ready`
6. Variáveis de ambiente: cole todas da lista acima.
7. Se estiver no Render Free e precisar aplicar migrations, defina `RUN_MIGRATIONS_ON_START=true` temporariamente e rode **Manual Deploy**.
8. Depois que as migrations passarem e o servico ficar live, remova `RUN_MIGRATIONS_ON_START` ou coloque `false` e rode novo deploy.
9. (Opcional) Disco persistente não é necessário — uploads vão para Cloudinary.

### Railway

1. New Project → Deploy from GitHub.
2. Root Directory: `backend`.
3. Build/Start: idem Render.
4. Generate Domain → use `api.seudominio.com` em **Settings → Domains**.
5. Healthcheck: `/api/v1/ready`.

### Fly.io

```bash
cd backend
fly launch --no-deploy           # gera fly.toml; aceite os defaults exceto db (escolha "no" — vamos usar Postgres externo)
fly secrets set DATABASE_URL=... JWT_ACCESS_SECRET=... [resto das vars]
fly deploy
```

No `fly.toml` adicione healthcheck:

```toml
[checks]
  [checks.ready]
    type = "http"
    interval = "30s"
    method = "GET"
    path = "/api/v1/ready"
    grace_period = "20s"
```

### Seed do admin (uma vez só)

Após o primeiro deploy bem-sucedido:

```bash
# Render pago/Railway/Fly com shell/job disponivel:
npm run prisma:seed

# Railway: railway run npm run prisma:seed
# Fly:    fly ssh console -C "npm run prisma:seed"
```

No Render Free nao ha Shell. Para rodar o seed sem gravar segredo no Git, execute localmente a partir de `backend/` usando variaveis de producao somente na sessao do terminal.

PowerShell:

```powershell
# Exemplo conceitual: nao cole valores reais neste arquivo.
$env:DATABASE_URL = "<DATABASE_URL_DE_PRODUCAO>"
$env:ADMIN_EMAIL = "<EMAIL>"
$env:ADMIN_NAME = "<NOME>"
$env:ADMIN_PASSWORD = "<SENHA_FORTE>"
npm run prisma:seed
Remove-Item Env:DATABASE_URL, Env:ADMIN_EMAIL, Env:ADMIN_NAME, Env:ADMIN_PASSWORD
```

Bash/zsh:

```bash
# Exemplo conceitual: nao cole valores reais neste arquivo.
DATABASE_URL="<DATABASE_URL_DE_PRODUCAO>" ADMIN_EMAIL="<EMAIL>" ADMIN_NAME="<NOME>" ADMIN_PASSWORD="<SENHA_FORTE>" npm run prisma:seed
```

O seed é idempotente (`upsert`). Pode rodar de novo sem corromper dados — só não recriará a senha se o usuário já existir.

---

## 5. Deploy do frontend (Vercel)

### Variáveis de ambiente

Em **Project Settings → Environment Variables**, adicione para todos os ambientes (Production, Preview, Development):

```env
NEXT_PUBLIC_SITE_URL=https://www.seudominio.com
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

### Configuração do projeto

- Framework Preset: **Next.js**.
- Root Directory: **`/`** (raiz do repo, **não** `backend`).
- Build Command: deixe o padrão (`next build`).
- Install Command: `npm ci`.

### Domínios

- Adicione `www.seudominio.com` (apex `seudominio.com` → redireciona para `www`).
- Configure DNS conforme instruções da Vercel.

### CORS no backend

Garanta que `FRONTEND_URL` no backend bate **exatamente** com o domínio do frontend (sem barra final). O `cors()` do Express usa essa string como `origin` da allowlist.

Se quiser permitir previews da Vercel (`*.vercel.app`), o código atual **não suporta wildcard** — você precisaria expandir `app.ts` para aceitar uma lista. Por simplicidade, mantenha somente o domínio final e teste preview manualmente apontando `NEXT_PUBLIC_API_URL` para a API de staging.

---

## 6. Smoke test pós-deploy

Em produção, valide nesta ordem:

1. `curl https://api.seudominio.com/api/v1/health` → 200.
2. `curl https://api.seudominio.com/api/v1/ready` → 200.
3. Abra `https://www.seudominio.com` — home renderiza sem erros.
4. Abra `https://www.seudominio.com/portfolio` — listagem aparece.
5. Faça login em `/login` com as credenciais do seed.
6. No dashboard: crie um projeto draft → publique → confira que aparece em `/portfolio` e na home (se `featured`).
7. Faça upload de uma imagem de capa → confirme URL no Cloudinary.
8. Envie o formulário de contato (se Resend configurado) → confirme recebimento.
9. Logout e tente acessar `/dashboard` → deve redirecionar para `/login`.

---

## 7. Rollback

### Backend

- **Render / Railway**: aba "Deployments" → escolha um deployment anterior e clique em **Rollback**. Migrations não são revertidas automaticamente — se o rollback exigir downgrade de schema, restaure o banco a partir de backup.
- **Fly**: `fly releases` lista versões; `fly deploy --image <release-image>` aponta para uma anterior.

### Frontend

- Vercel: aba "Deployments" → "Promote to Production" em um deploy anterior. Reverso instantâneo, sem migrations envolvidas.

### Banco

- Supabase/Neon mantêm backups diários no plano free. Restaure via dashboard se uma migration corromper dados.

---

## 8. Manutenção e operação

- **Logs**: backend usa `pino` estruturado com `requestId`. Em provedores cloud, inspecione via dashboard de logs.
- **Auditoria**: tabela `AuditLog` registra ações administrativas (login, CRUD de projetos/imagens/equipe/conteúdo, alterações de usuário). Consulte via SQL direto no banco quando necessário.
- **Imagens órfãs no Cloudinary**: a `TASK 11.16` recomenda criar rotina manual. Por enquanto, soft-delete de imagem **não** apaga do Cloudinary; apenas exclusão definitiva (`DELETE /admin/project-images/:id/cloudinary`, restrita a `ADMIN`) faz isso.
- **Alterar segredos**: ao trocar `JWT_ACCESS_SECRET` ou `JWT_REFRESH_SECRET`, todas as sessões ativas invalidam. Trate como operação de incident response, não como rotina.
- **Reset de senha de admin**: SSH no backend → `npm run prisma:seed` (após ajustar `ADMIN_PASSWORD` na env) ou use `/dashboard/usuarios` se houver outro admin disponível.
- **Segredos expostos**: se uma senha, token, connection string ou chave foi colada em chat, issue, commit, log publico ou screenshot, rotacione no provedor e atualize as variaveis de ambiente. Apagar o texto depois nao torna o segredo confiavel novamente.

### Checklist anti-vazamento para repo publico

- [ ] `git grep` nao encontra senhas reais, tokens, project refs privados ou hosts reais de banco.
- [ ] `.env` e `backend/.env` nao estao versionados.
- [ ] Docs usam `<PLACEHOLDER>` para valores sensiveis.
- [ ] Screenshots enviados para issue/PR nao mostram secrets.
- [ ] Variaveis reais ficam apenas em Render, Vercel, Supabase, Cloudinary e arquivos locais ignorados pelo Git.

---

## 9. Checklist final antes de anunciar a produção

- [ ] DNS apontando — `www.seudominio.com` e `api.seudominio.com` resolvem.
- [ ] Certificados HTTPS válidos nos dois domínios (Vercel/provedor cuidam).
- [ ] `ADMIN_PASSWORD` real (não a do exemplo) salva no env do backend.
- [ ] Pelo menos um projeto `PUBLISHED` no banco para a home não ficar vazia.
- [ ] Pelo menos um membro de equipe ativo.
- [ ] Cloudinary com pasta dedicada (não usar conta compartilhada de dev).
- [ ] `RATE_LIMIT_*` revisado: o default (100/15min global) é conservador — ajuste se o tráfego previsto for alto.
- [ ] Backup automático do Postgres habilitado.
- [ ] Healthcheck do provedor apontando para `/api/v1/ready`, não `/health` (assim a instância é marcada unhealthy se o banco cair).
- [ ] Monitoramento/alerta de erros 5xx configurado no provedor.
- [ ] Smoke test (seção 6) executado.
