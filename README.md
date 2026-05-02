# Studio WT Portfolio

Site institucional e portfolio para escritorio de arquitetura, construido com Next.js, Tailwind CSS, Prisma, Cloudinary e Auth.js.

## Setup local

1. Instale as dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha as variaveis reais.

3. Gere o client Prisma quando o schema mudar:

```bash
npx prisma generate
```

4. Rode as migrations quando houver uma `DATABASE_URL` real:

```bash
npx prisma migrate dev
```

5. Crie ou atualize o usuario admin inicial:

```bash
npm run seed
```

6. Inicie o servidor:

```bash
npm run dev
```

## Autenticacao

O painel fica em `/dashboard` e e protegido por Auth.js via `src/proxy.ts`.

Para login local, configure no `.env`:

```env
AUTH_SECRET="um-secret-seguro"
AUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@studiowt.com.br"
ADMIN_NAME="Studio WT Admin"
ADMIN_PASSWORD="uma-senha-com-8-caracteres-ou-mais"
```

Depois rode `npm run seed` e acesse `/login`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run format
npm run format:check
npm run seed
```
