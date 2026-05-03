# Studio WT — Portfólio

Site institucional e portfólio para escritório de arquitetura.

Arquitetura em duas camadas:

- **Frontend** (`/`) — Next.js 16 (App Router) + Tailwind v4 + shadcn/ui. Apenas consome a API.
- **Backend** (`/backend`) — Express + Prisma 7 + PostgreSQL + Cloudinary. Fonte oficial dos dados.

Frontend e backend rodam como processos separados. O frontend só fala com o banco através da API.

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ (local, Supabase, Neon, Railway, etc.)
- Conta no Cloudinary (free tier serve)
- Conta no Resend (opcional, só para envio de e-mail do formulário de contato)

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo>
cd arquitetos-portfolio
npm install
cd backend && npm install && cd ..
```

### 2. Variáveis de ambiente

**Backend** (`backend/.env`) — copie de `backend/.env.example`:

```env
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://user:senha@localhost:5432/arquitetos

JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
COOKIE_SECRET=<32+ chars>
CSRF_SECRET=<32+ chars>

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

ADMIN_EMAIL=admin@studiowt.com.br
ADMIN_NAME=Studio WT Admin
ADMIN_PASSWORD=<senha-forte>

# Opcional — formulário de contato
RESEND_API_KEY=
CONTACT_FROM_EMAIL=site@seudominio.com
CONTACT_TO_EMAIL=contato@seudominio.com
```

Os 4 segredos JWT/cookie/CSRF precisam ter no mínimo 32 caracteres. Gere com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend** (`.env`) — copie de `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Banco de dados (apenas no backend)

```bash
cd backend
npx prisma migrate deploy   # aplica migrations existentes
npm run prisma:seed         # cria usuário admin + conteúdos padrão
cd ..
```

### 4. Rodar em dev

Em dois terminais:

```bash
# terminal 1
cd backend
npm run dev      # API em http://localhost:4000

# terminal 2
npm run dev      # site em http://localhost:3000
```

A documentação OpenAPI fica em `http://localhost:4000/api/v1/docs` (somente em dev).

Login admin: `http://localhost:3000/login` com as credenciais do seed.

---

## Scripts

### Frontend

```bash
npm run dev          # next dev
npm run build        # next build (precisa do backend rodando para SSG)
npm start            # next start (após build)
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier --write .
```

### Backend

```bash
cd backend
npm run dev               # tsx watch
npm run build             # tsc
npm start                 # node dist/server.js
npm run lint              # eslint src
npm run typecheck         # tsc --noEmit
npm test                  # vitest (watch)
npm run test:run          # vitest run (CI)
npm run prisma:migrate    # prisma migrate dev
npm run prisma:seed       # cria/atualiza admin + site content
```

---

## Estrutura

```
.
├── backend/                  API Express (fonte da verdade)
│   ├── prisma/               schema, migrations, seed
│   └── src/
│       ├── modules/          auth, users, projects, project-images,
│       │                     team, site-content, media, contact, audit
│       ├── middlewares/      authenticate, requireRole, csrf, rate-limit, upload
│       ├── routes/           /api/v1 (admin + public)
│       ├── config/           env (Zod), cors, security, cloudinary, swagger
│       └── tests/            vitest unit
├── src/                      Frontend Next.js
│   ├── app/
│   │   ├── (public)/         home, sobre, portfolio, equipe, layout público
│   │   ├── (admin)/          /dashboard/* (protegido pelo proxy)
│   │   └── login/
│   ├── components/           UI, portfolio, team, admin, etc.
│   └── lib/
│       ├── api-client.ts     publicGet, adminGet, adminMutate, adminUpload
│       ├── api/              auth, projects, team, site, users (clientes por domínio)
│       └── ...
└── public/                   logos, fotos institucionais, fontes locais
```

---

## Autenticação

- Cookies httpOnly emitidos pelo backend Express.
- Frontend não usa NextAuth — `src/proxy.ts` (middleware) verifica `accessToken` e renova via `refresh_token` quando expira.
- Mutações administrativas precisam de header `X-CSRF-Token` (gerenciado pelo `adminMutate`).
- Roles: `ADMIN` (acesso total + usuários) e `ARCHITECT` (gerencia conteúdo).

---

## Deploy

Veja [DEPLOY.md](./DEPLOY.md) para o passo a passo de produção (frontend na Vercel + backend em Render/Railway/Fly + Postgres gerenciado + Cloudinary).
