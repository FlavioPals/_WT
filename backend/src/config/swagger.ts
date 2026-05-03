import { env } from './env'

const serverUrl = env.API_URL

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Arquitetos Portfolio API',
    version: '1.0.0',
    description:
      'API REST para o site institucional e painel de administração do escritório de arquitetura. ' +
      'Disponível apenas em desenvolvimento.',
    contact: { email: 'dev@arquitetos.com' },
  },
  servers: [{ url: `${serverUrl}/api/v1`, description: 'Servidor local' }],

  // ─── Security schemes ──────────────────────────────────────────────────────
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT de acesso enviado no header `Authorization: Bearer <token>`. ' +
          'O frontend armazena esse token em cookie httpOnly e o encaminha como Bearer nas chamadas server-side.',
      },
      csrfHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description:
          'Token CSRF obtido em `GET /auth/csrf`. Deve ser enviado no header `X-CSRF-Token` e no cookie `csrf_token` em mutacoes autenticadas.',
      },
    },

    // ─── Reusable schemas ────────────────────────────────────────────────────
    schemas: {
      // ── Enums ────────────────────────────────────────────────────────────
      Role: {
        type: 'string',
        enum: ['ADMIN', 'ARCHITECT', 'EDITOR'],
        description: '`ADMIN` acesso total · `ARCHITECT` projetos e imagens · `EDITOR` conteúdo',
      },
      ProjectStatus: {
        type: 'string',
        enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
        description: 'Status do projeto. Apenas `PUBLISHED` aparece nas rotas públicas.',
      },
      ProjectImageType: {
        type: 'string',
        enum: ['GALLERY', 'TECHNICAL', 'ARTISTIC', 'COVER'],
      },
      SiteContentType: {
        type: 'string',
        enum: ['TEXT', 'RICH_TEXT', 'IMAGE', 'JSON', 'URL', 'EMAIL', 'PHONE'],
      },

      // ── Common shapes ─────────────────────────────────────────────────────
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 12 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 4 },
        },
      },
      Meta: {
        type: 'object',
        properties: {
          requestId: { type: 'string', example: 'req_01HZ' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ErrorBody: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid payload.' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
          meta: { $ref: '#/components/schemas/Meta' },
        },
      },

      // ── Auth ─────────────────────────────────────────────────────────────
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@studio.com' },
          password: { type: 'string', format: 'password', example: 'Str0ng!Pass' },
        },
      },
      UserMe: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxyz' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { $ref: '#/components/schemas/Role' },
          active: { type: 'boolean' },
        },
      },

      // ── Projects ─────────────────────────────────────────────────────────
      ProjectBase: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', maxLength: 160 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          description: { type: 'string' },
          concept: { type: 'string', nullable: true },
          year: { type: 'integer', nullable: true, minimum: 1900 },
          location: { type: 'string', nullable: true },
          area: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          coverImage: { type: 'string', format: 'uri', nullable: true },
          featured: { type: 'boolean' },
          order: { type: 'integer', minimum: 0 },
          status: { $ref: '#/components/schemas/ProjectStatus' },
          seoTitle: { type: 'string', maxLength: 160, nullable: true },
          seoDescription: { type: 'string', maxLength: 300, nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateProjectRequest: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 160, example: 'Casa Viana' },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
            example: 'casa-viana',
            description: 'Gerado automaticamente a partir do título se omitido.',
          },
          description: { type: 'string', minLength: 1, example: 'Residência unifamiliar...' },
          concept: { type: 'string', nullable: true },
          year: { type: 'integer', minimum: 1900, nullable: true, example: 2023 },
          location: { type: 'string', nullable: true, example: 'São Paulo, SP' },
          area: { type: 'string', nullable: true, example: '320 m²' },
          category: { type: 'string', nullable: true, example: 'Residencial' },
          coverImage: { type: 'string', format: 'uri', nullable: true },
          featured: { type: 'boolean', default: false },
          order: { type: 'integer', minimum: 0, default: 0 },
          seoTitle: { type: 'string', maxLength: 160, nullable: true },
          seoDescription: { type: 'string', maxLength: 300, nullable: true },
        },
      },
      UpdateProjectRequest: {
        allOf: [
          { $ref: '#/components/schemas/CreateProjectRequest' },
          { description: 'Todos os campos são opcionais (PATCH parcial).' },
        ],
      },
      ReorderRequest: {
        type: 'object',
        required: ['ids'],
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            example: ['id1', 'id2', 'id3'],
            description: 'Lista de IDs na nova ordem desejada.',
          },
        },
      },

      // ── Project Images ────────────────────────────────────────────────────
      ProjectImage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          projectId: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          publicId: { type: 'string' },
          type: { $ref: '#/components/schemas/ProjectImageType' },
          alt: { type: 'string', nullable: true },
          caption: { type: 'string', nullable: true },
          order: { type: 'integer' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          bytes: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateImageRequest: {
        type: 'object',
        properties: {
          alt: { type: 'string', maxLength: 200, nullable: true },
          caption: { type: 'string', maxLength: 400, nullable: true },
          type: { $ref: '#/components/schemas/ProjectImageType' },
          order: { type: 'integer', minimum: 0 },
        },
      },

      // ── Team ─────────────────────────────────────────────────────────────
      TeamMemberBase: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          role: { type: 'string' },
          bio: { type: 'string' },
          photoUrl: { type: 'string', format: 'uri' },
          email: { type: 'string', format: 'email', nullable: true },
          instagramUrl: { type: 'string', format: 'uri', nullable: true },
          linkedinUrl: { type: 'string', format: 'uri', nullable: true },
          active: { type: 'boolean' },
          order: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTeamMemberRequest: {
        type: 'object',
        required: ['name', 'role', 'bio', 'photoUrl'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120, example: 'Ana Costa' },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', example: 'ana-costa' },
          role: { type: 'string', minLength: 2, maxLength: 120, example: 'Sócia-fundadora' },
          bio: {
            type: 'string',
            minLength: 1,
            maxLength: 5000,
            example: 'Arquiteta com 15 anos...',
          },
          photoUrl: { type: 'string', format: 'uri' },
          photoPublicId: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email', nullable: true },
          instagramUrl: { type: 'string', format: 'uri', nullable: true },
          linkedinUrl: { type: 'string', format: 'uri', nullable: true },
          active: { type: 'boolean', default: true },
          order: { type: 'integer', minimum: 0, default: 0 },
        },
      },

      // ── Site Content ──────────────────────────────────────────────────────
      SiteContent: {
        type: 'object',
        properties: {
          key: { type: 'string', example: 'home:hero:title' },
          value: { type: 'string' },
          label: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          type: { $ref: '#/components/schemas/SiteContentType' },
          group: { type: 'string', nullable: true },
          metadata: { nullable: true },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateSiteContentRequest: {
        type: 'object',
        required: ['value'],
        properties: {
          value: { type: 'string', maxLength: 50000 },
          label: { type: 'string', maxLength: 160, nullable: true },
          description: { type: 'string', maxLength: 500, nullable: true },
          metadata: { nullable: true },
        },
      },
      BulkUpdateSiteContentRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 100,
            items: {
              type: 'object',
              required: ['key', 'value'],
              properties: {
                key: { type: 'string', example: 'home:hero:title' },
                value: { type: 'string', maxLength: 50000 },
                label: { type: 'string', maxLength: 160, nullable: true },
                description: { type: 'string', maxLength: 500, nullable: true },
                metadata: { nullable: true },
              },
            },
          },
        },
      },

      // ── Media ─────────────────────────────────────────────────────────────
      MediaAsset: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          publicId: { type: 'string' },
          folder: { type: 'string' },
          alt: { type: 'string', nullable: true },
          caption: { type: 'string', nullable: true },
          width: { type: 'integer' },
          height: { type: 'integer' },
          bytes: { type: 'integer' },
          format: { type: 'string', example: 'jpg' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ── Users ─────────────────────────────────────────────────────────────
      AdminUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { $ref: '#/components/schemas/Role' },
          active: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'editor@studio.com' },
          name: { type: 'string', minLength: 2, maxLength: 120, example: 'Maria Lima' },
          role: { $ref: '#/components/schemas/Role' },
          active: { type: 'boolean', default: true },
          temporaryPassword: {
            type: 'string',
            minLength: 12,
            maxLength: 128,
            example: 'Temp@1234abcd',
            description:
              'Mínimo 12 caracteres com maiúscula, minúscula, número e símbolo. Se omitido, é gerado automaticamente.',
          },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 2, maxLength: 120 },
          role: { $ref: '#/components/schemas/Role' },
          active: { type: 'boolean' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        properties: {
          temporaryPassword: {
            type: 'string',
            minLength: 12,
            maxLength: 128,
            description: 'Se omitido, a senha é gerada automaticamente.',
          },
        },
      },

      // ── Contact ───────────────────────────────────────────────────────────
      ContactRequest: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120, example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          phone: {
            type: 'string',
            minLength: 8,
            maxLength: 30,
            example: '(11) 99999-0000',
            description: 'Opcional. Aceita dígitos, parênteses, hífens, espaços e ponto.',
            nullable: true,
          },
          message: {
            type: 'string',
            minLength: 10,
            maxLength: 3000,
            example: 'Gostaria de um orçamento...',
          },
          website: {
            type: 'string',
            maxLength: 200,
            default: '',
            description: 'Campo honeypot — deve ser enviado vazio pelo frontend legítimo.',
          },
        },
      },
    },

    // ─── Reusable responses ───────────────────────────────────────────────────
    responses: {
      Unauthorized: {
        description: 'Não autenticado.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
        },
      },
      Forbidden: {
        description: 'Permissão insuficiente (role ou CSRF inválido).',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
        },
      },
      NotFound: {
        description: 'Recurso não encontrado.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
        },
      },
      ValidationError: {
        description: 'Payload inválido.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
        },
      },
      RateLimited: {
        description: 'Muitas requisições.',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
        },
      },
    },

    // ─── Reusable parameters ──────────────────────────────────────────────────
    parameters: {
      PageParam: {
        in: 'query',
        name: 'page',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      LimitParam: {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 12 },
      },
      SortDirectionParam: {
        in: 'query',
        name: 'direction',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
      },
      DeletedParam: {
        in: 'query',
        name: 'deleted',
        schema: { type: 'boolean', default: false },
        description: 'Quando `true`, retorna apenas registros soft-deleted.',
      },
    },
  },

  // ─── Tags ──────────────────────────────────────────────────────────────────
  tags: [
    { name: 'Health', description: 'Status da API' },
    { name: 'Auth', description: 'Autenticação, CSRF e sessão' },
    { name: 'Public · Projects', description: 'Projetos visíveis publicamente (apenas PUBLISHED)' },
    { name: 'Public · Team', description: 'Membros da equipe visíveis publicamente' },
    { name: 'Public · Site', description: 'Conteúdo do site (textos, imagens) público' },
    { name: 'Public · Contact', description: 'Formulário de contato' },
    {
      name: 'Admin · Projects',
      description: 'CRUD completo de projetos (roles: ADMIN, ARCHITECT, EDITOR)',
    },
    {
      name: 'Admin · Images',
      description: 'Upload e gerenciamento de imagens de projetos (roles: ADMIN, ARCHITECT)',
    },
    { name: 'Admin · Team', description: 'CRUD de equipe (roles: ADMIN, ARCHITECT, EDITOR)' },
    { name: 'Admin · Site Content', description: 'Gerenciamento de conteúdo do site' },
    { name: 'Admin · Media', description: 'Biblioteca de mídia geral (Cloudinary)' },
    { name: 'Admin · Users', description: 'Gerenciamento de usuários (role: ADMIN)' },
  ],

  // ─── Paths ─────────────────────────────────────────────────────────────────
  paths: {
    // ── Health ────────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica status da API',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'API em operação.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        uptime: { type: 'number', example: 1234.56 },
                        environment: { type: 'string', example: 'development' },
                      },
                    },
                    meta: { $ref: '#/components/schemas/Meta' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/ready': {
      get: {
        tags: ['Health'],
        summary: 'Verifica se a API está pronta (com banco)',
        description:
          'Executa uma query simples no banco para garantir que a API consegue atender requisições. ' +
          'Provedores de deploy podem usar este endpoint como readiness probe.',
        operationId: 'getReady',
        responses: {
          200: {
            description: 'API pronta — banco respondendo.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ready' },
                        database: { type: 'string', example: 'ok' },
                      },
                    },
                    meta: { $ref: '#/components/schemas/Meta' },
                  },
                },
              },
            },
          },
          503: {
            description: 'Banco indisponível.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
        },
      },
    },

    // ── Auth ──────────────────────────────────────────────────────────────────
    '/auth/csrf': {
      get: {
        tags: ['Auth'],
        summary: 'Obtém token CSRF',
        description:
          'Retorna o token CSRF no body e também define o cookie `csrf_token`. ' +
          'Deve ser chamado antes de qualquer mutação protegida.',
        operationId: 'getCsrf',
        responses: {
          200: {
            description: 'Token CSRF gerado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: { csrfToken: { type: 'string', example: 'abc123...' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Realiza login',
        description:
          'Autentica o usuário, retorna `accessToken` no body e define o cookie httpOnly `refresh_token`. ' +
          'Rate limit: **10 tentativas / 15 minutos**.',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Login bem-sucedido. Access token retornado e refresh token definido.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/UserMe' },
                      },
                    },
                    meta: { $ref: '#/components/schemas/Meta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renova o access token',
        description:
          'Usa o cookie `refresh_token` para emitir um novo `accessToken`. ' + 'Não requer CSRF.',
        operationId: 'refresh',
        responses: {
          200: { description: 'Token renovado. Novo `accessToken` retornado no body.' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Encerra a sessão atual',
        description: 'Invalida o refresh token atual e limpa os cookies. Não requer CSRF.',
        operationId: 'logout',
        responses: {
          204: { description: 'Logout realizado.' },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Encerra todas as sessões do usuário',
        description: 'Revoga todos os refresh tokens do usuário autenticado. Requer CSRF.',
        operationId: 'logoutAll',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        responses: {
          204: { description: 'Todas as sessões encerradas.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Retorna dados do usuário autenticado',
        operationId: 'getMe',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados do usuário.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/UserMe' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Public · Projects ─────────────────────────────────────────────────────
    '/public/projects': {
      get: {
        tags: ['Public · Projects'],
        summary: 'Lista projetos publicados',
        operationId: 'listPublicProjects',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          {
            in: 'query',
            name: 'category',
            schema: { type: 'string', example: 'Residencial' },
          },
          {
            in: 'query',
            name: 'featured',
            schema: { type: 'boolean' },
          },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', enum: ['order', 'year', 'createdAt'], default: 'order' },
          },
          { $ref: '#/components/parameters/SortDirectionParam' },
        ],
        responses: {
          200: {
            description: 'Lista paginada de projetos.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProjectBase' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                    meta: { $ref: '#/components/schemas/Meta' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/public/projects/{slug}': {
      get: {
        tags: ['Public · Projects'],
        summary: 'Retorna projeto publicado por slug',
        operationId: 'getPublicProject',
        parameters: [
          {
            in: 'path',
            name: 'slug',
            required: true,
            schema: { type: 'string', example: 'casa-viana' },
          },
        ],
        responses: {
          200: {
            description: 'Projeto encontrado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/ProjectBase' } },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Public · Team ─────────────────────────────────────────────────────────
    '/public/team': {
      get: {
        tags: ['Public · Team'],
        summary: 'Lista membros da equipe ativos',
        operationId: 'listPublicTeam',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', enum: ['order', 'name'], default: 'order' },
          },
          { $ref: '#/components/parameters/SortDirectionParam' },
        ],
        responses: {
          200: {
            description: 'Lista de membros.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/TeamMemberBase' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                    meta: { $ref: '#/components/schemas/Meta' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Public · Site ─────────────────────────────────────────────────────────
    '/public/site': {
      get: {
        tags: ['Public · Site'],
        summary: 'Retorna conteúdos do site',
        operationId: 'listPublicSite',
        parameters: [
          {
            in: 'query',
            name: 'group',
            schema: { type: 'string', example: 'home' },
            description: 'Filtra por grupo (ex.: `home`, `sobre`, `footer`).',
          },
          {
            in: 'query',
            name: 'keys',
            schema: { type: 'string', example: 'home:hero:title,home:hero:subtitle' },
            description: 'Lista de chaves separadas por vírgula.',
          },
        ],
        responses: {
          200: {
            description: 'Conteúdos encontrados.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/SiteContent' } },
                    meta: { $ref: '#/components/schemas/Meta' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Public · Contact ──────────────────────────────────────────────────────
    '/public/contact': {
      post: {
        tags: ['Public · Contact'],
        summary: 'Envia mensagem de contato',
        description:
          'Valida payload e envia e-mail via Resend. ' +
          'Rate limit: **5 tentativas / 15 minutos** por IP. ' +
          'O campo `website` é um honeypot: deve ser enviado **vazio**. ' +
          'Se preenchido, retorna `202` sem enviar o e-mail.',
        operationId: 'submitContact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContactRequest' },
              example: {
                name: 'João Silva',
                email: 'joao@email.com',
                phone: '(11) 99999-0000',
                message: 'Gostaria de um orçamento para reforma residencial.',
                website: '',
              },
            },
          },
        },
        responses: {
          202: {
            description: 'Mensagem recebida (ou honeypot detectado — sem distinção intencional).',
          },
          400: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/RateLimited' },
          503: {
            description: 'Provedor de e-mail indisponível. Erro genérico sem stack trace.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
        },
      },
    },

    // ── Admin · Projects ──────────────────────────────────────────────────────
    '/admin/projects': {
      get: {
        tags: ['Admin · Projects'],
        summary: 'Lista todos os projetos (admin)',
        operationId: 'listAdminProjects',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'featured', schema: { type: 'boolean' } },
          { in: 'query', name: 'status', schema: { $ref: '#/components/schemas/ProjectStatus' } },
          { $ref: '#/components/parameters/DeletedParam' },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', enum: ['order', 'year', 'createdAt'], default: 'order' },
          },
          { $ref: '#/components/parameters/SortDirectionParam' },
        ],
        responses: {
          200: {
            description: 'Lista paginada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProjectBase' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Admin · Projects'],
        summary: 'Cria projeto',
        operationId: 'createProject',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Projeto criado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/ProjectBase' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/projects/reorder': {
      post: {
        tags: ['Admin · Projects'],
        summary: 'Reordena projetos',
        operationId: 'reorderProjects',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReorderRequest' } },
          },
        },
        responses: {
          204: { description: 'Reordenado com sucesso.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/projects/{id}': {
      get: {
        tags: ['Admin · Projects'],
        summary: 'Retorna projeto por ID',
        operationId: 'getAdminProject',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Projeto encontrado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/ProjectBase' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Admin · Projects'],
        summary: 'Atualiza projeto (parcial)',
        operationId: 'updateProject',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateProjectRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Projeto atualizado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/ProjectBase' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Admin · Projects'],
        summary: 'Deleta projeto (soft delete)',
        operationId: 'deleteProject',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Projeto removido (soft delete).' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/projects/{id}/restore': {
      post: {
        tags: ['Admin · Projects'],
        summary: 'Restaura projeto deletado',
        operationId: 'restoreProject',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Projeto restaurado.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/projects/{id}/publish': {
      post: {
        tags: ['Admin · Projects'],
        summary: 'Publica projeto',
        description: 'Muda o status de DRAFT/ARCHIVED para PUBLISHED.',
        operationId: 'publishProject',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Projeto publicado.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/projects/{id}/unpublish': {
      post: {
        tags: ['Admin · Projects'],
        summary: 'Despublica projeto',
        description: 'Muda o status de PUBLISHED para DRAFT.',
        operationId: 'unpublishProject',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Projeto despublicado.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin · Images ─────────────────────────────────────────────────────────
    '/admin/projects/{projectId}/images': {
      get: {
        tags: ['Admin · Images'],
        summary: 'Lista imagens de um projeto',
        operationId: 'listProjectImages',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'projectId', required: true, schema: { type: 'string' } },
          {
            in: 'query',
            name: 'type',
            schema: { $ref: '#/components/schemas/ProjectImageType' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de imagens.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProjectImage' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Admin · Images'],
        summary: 'Faz upload de imagens para o projeto',
        description:
          'Upload multipart de até **20 arquivos** simultâneos. ' +
          'Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo configurável via `UPLOAD_MAX_FILE_SIZE_MB` (default: 8 MB). ' +
          'Requer roles: **ADMIN** ou **ARCHITECT**.',
        operationId: 'uploadProjectImages',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'projectId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: {
                  files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description:
                      'Campo `files` (até 20 arquivos). Ex.: `-F "files=@foto1.jpg" -F "files=@foto2.jpg"`',
                  },
                  type: {
                    $ref: '#/components/schemas/ProjectImageType',
                    description: 'Default: `GALLERY`',
                  },
                  alt: {
                    type: 'string',
                    maxLength: 200,
                    description: 'Texto alternativo (acessibilidade).',
                  },
                  caption: {
                    type: 'string',
                    maxLength: 400,
                    description: 'Legenda exibida no frontend.',
                  },
                },
              },
              encoding: { files: { contentType: 'image/jpeg, image/png, image/webp' } },
            },
          },
        },
        responses: {
          201: {
            description: 'Imagens enviadas e salvas no Cloudinary.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProjectImage' } },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/projects/{projectId}/images/reorder': {
      post: {
        tags: ['Admin · Images'],
        summary: 'Reordena imagens do projeto',
        operationId: 'reorderProjectImages',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'projectId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReorderRequest' } },
          },
        },
        responses: {
          204: { description: 'Reordenado.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/projects/{projectId}/cover': {
      post: {
        tags: ['Admin · Images'],
        summary: 'Define imagem de capa do projeto',
        operationId: 'setProjectCover',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'projectId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['imageId'],
                properties: {
                  imageId: {
                    type: 'string',
                    description: 'ID da imagem a ser definida como capa.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Capa definida.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/project-images/{imageId}': {
      get: {
        tags: ['Admin · Images'],
        summary: 'Retorna imagem por ID',
        operationId: 'getProjectImage',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'imageId', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Imagem encontrada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/ProjectImage' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Admin · Images'],
        summary: 'Atualiza metadados da imagem',
        operationId: 'updateProjectImage',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'imageId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateImageRequest' } },
          },
        },
        responses: {
          200: { description: 'Imagem atualizada.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      delete: {
        tags: ['Admin · Images'],
        summary: 'Remove imagem (soft delete)',
        operationId: 'deleteProjectImage',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'imageId', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Imagem removida do banco (mantida no Cloudinary).' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/project-images/{imageId}/cloudinary': {
      delete: {
        tags: ['Admin · Images'],
        summary: 'Remove imagem permanentemente (Cloudinary + banco)',
        description:
          'Requer role **ADMIN**. Deleta o asset no Cloudinary e remove o registro do banco.',
        operationId: 'hardDeleteProjectImage',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'imageId', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Imagem deletada permanentemente.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin · Team ──────────────────────────────────────────────────────────
    '/admin/team': {
      get: {
        tags: ['Admin · Team'],
        summary: 'Lista membros da equipe (admin)',
        operationId: 'listAdminTeam',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          { in: 'query', name: 'active', schema: { type: 'boolean' } },
          { $ref: '#/components/parameters/DeletedParam' },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', enum: ['order', 'name', 'createdAt'], default: 'order' },
          },
          { $ref: '#/components/parameters/SortDirectionParam' },
        ],
        responses: {
          200: {
            description: 'Lista paginada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/TeamMemberBase' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Admin · Team'],
        summary: 'Cria membro da equipe',
        operationId: 'createTeamMember',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTeamMemberRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Membro criado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/TeamMemberBase' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/team/reorder': {
      post: {
        tags: ['Admin · Team'],
        summary: 'Reordena membros da equipe',
        operationId: 'reorderTeam',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReorderRequest' } },
          },
        },
        responses: {
          204: { description: 'Reordenado.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/team/{id}': {
      get: {
        tags: ['Admin · Team'],
        summary: 'Retorna membro por ID',
        operationId: 'getAdminTeamMember',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Membro encontrado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/TeamMemberBase' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Admin · Team'],
        summary: 'Atualiza membro (parcial)',
        operationId: 'updateTeamMember',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CreateTeamMemberRequest' },
                  { description: 'Todos os campos são opcionais.' },
                ],
              },
            },
          },
        },
        responses: {
          200: { description: 'Membro atualizado.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Admin · Team'],
        summary: 'Remove membro (soft delete)',
        operationId: 'deleteTeamMember',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Membro removido.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/team/{id}/photo': {
      post: {
        tags: ['Admin · Team'],
        summary: 'Faz upload da foto do membro',
        description:
          'Upload multipart de **1 arquivo** (campo `photo`). ' +
          'Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: `UPLOAD_MAX_FILE_SIZE_MB` (default 8 MB). ' +
          'A imagem é enviada para o Cloudinary e a URL é salva no membro.',
        operationId: 'uploadTeamMemberPhoto',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['photo'],
                properties: {
                  photo: {
                    type: 'string',
                    format: 'binary',
                    description: 'Campo `photo` — arquivo de imagem único.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Foto enviada. URL atualizada no membro.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin · Site Content ──────────────────────────────────────────────────
    '/admin/site-content': {
      get: {
        tags: ['Admin · Site Content'],
        summary: 'Lista conteúdos do site (admin)',
        operationId: 'listAdminSiteContent',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'group', schema: { type: 'string', example: 'home' } },
          { in: 'query', name: 'type', schema: { $ref: '#/components/schemas/SiteContentType' } },
        ],
        responses: {
          200: {
            description: 'Lista de conteúdos.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/SiteContent' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/admin/site-content/bulk': {
      patch: {
        tags: ['Admin · Site Content'],
        summary: 'Atualiza múltiplos conteúdos em lote',
        description: 'Limite: **100 itens por requisição**.',
        operationId: 'bulkUpdateSiteContent',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BulkUpdateSiteContentRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Conteúdos atualizados.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/site-content/{key}': {
      get: {
        tags: ['Admin · Site Content'],
        summary: 'Retorna conteúdo por chave',
        operationId: 'getAdminSiteContent',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'key',
            required: true,
            schema: { type: 'string', example: 'home:hero:title' },
          },
        ],
        responses: {
          200: {
            description: 'Conteúdo encontrado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/SiteContent' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Admin · Site Content'],
        summary: 'Atualiza conteúdo por chave (substituição completa)',
        operationId: 'updateSiteContent',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [
          {
            in: 'path',
            name: 'key',
            required: true,
            schema: { type: 'string', example: 'home:hero:title' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateSiteContentRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Conteúdo atualizado.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/site-content/{key}/image': {
      post: {
        tags: ['Admin · Site Content'],
        summary: 'Faz upload de imagem para um conteúdo',
        description:
          'Upload multipart de **1 arquivo** (campo `image`). ' +
          'Após o upload, o campo `value` do conteúdo é atualizado com a URL do Cloudinary.',
        operationId: 'uploadSiteContentImage',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [
          {
            in: 'path',
            name: 'key',
            required: true,
            schema: { type: 'string', example: 'sobre:foto-principal' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Campo `image` — arquivo de imagem.',
                  },
                  folder: { type: 'string', default: 'media', description: 'Pasta no Cloudinary.' },
                  alt: { type: 'string', maxLength: 200 },
                  caption: { type: 'string', maxLength: 400 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Imagem enviada. Conteúdo atualizado.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin · Media ─────────────────────────────────────────────────────────
    '/admin/media': {
      get: {
        tags: ['Admin · Media'],
        summary: 'Lista assets de mídia',
        operationId: 'listMediaAssets',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 24 },
          },
          { in: 'query', name: 'folder', schema: { type: 'string', example: 'media' } },
          { $ref: '#/components/parameters/DeletedParam' },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string', enum: ['createdAt', 'bytes'], default: 'createdAt' },
          },
          {
            in: 'query',
            name: 'direction',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de assets.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/MediaAsset' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Admin · Media'],
        summary: 'Faz upload de múltiplos arquivos para a biblioteca de mídia',
        description:
          'Upload multipart de até **20 arquivos** (campo `files`). ' +
          'Formatos aceitos: JPEG, PNG, WebP. Limite por arquivo: `UPLOAD_MAX_FILE_SIZE_MB` (default 8 MB).',
        operationId: 'uploadMediaAssets',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: {
                  files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Campo `files` — até 20 arquivos de imagem.',
                  },
                  folder: {
                    type: 'string',
                    default: 'media',
                    pattern: '^[a-z0-9/_-]+$',
                    description: 'Pasta no Cloudinary (default: `media`).',
                  },
                  alt: { type: 'string', maxLength: 200 },
                  caption: { type: 'string', maxLength: 400 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Assets enviados.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/MediaAsset' } },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/media/{id}': {
      get: {
        tags: ['Admin · Media'],
        summary: 'Retorna asset por ID',
        operationId: 'getMediaAsset',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Asset encontrado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/MediaAsset' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Admin · Media'],
        summary: 'Atualiza metadados do asset',
        operationId: 'updateMediaAsset',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  alt: { type: 'string', maxLength: 200, nullable: true },
                  caption: { type: 'string', maxLength: 400, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Asset atualizado.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      delete: {
        tags: ['Admin · Media'],
        summary: 'Remove asset (soft delete)',
        operationId: 'deleteMediaAsset',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Asset marcado como deletado.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/media/{id}/cloudinary': {
      delete: {
        tags: ['Admin · Media'],
        summary: 'Remove asset permanentemente (Cloudinary + banco)',
        description: 'Requer role **ADMIN**.',
        operationId: 'hardDeleteMediaAsset',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Asset deletado permanentemente.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Admin · Users ─────────────────────────────────────────────────────────
    '/admin/users': {
      get: {
        tags: ['Admin · Users'],
        summary: 'Lista usuários',
        description: 'Requer role **ADMIN**.',
        operationId: 'listUsers',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          {
            in: 'query',
            name: 'q',
            schema: { type: 'string', description: 'Busca por nome ou e-mail.' },
          },
          { in: 'query', name: 'role', schema: { $ref: '#/components/schemas/Role' } },
          { in: 'query', name: 'active', schema: { type: 'boolean' } },
          { $ref: '#/components/parameters/DeletedParam' },
          {
            in: 'query',
            name: 'sort',
            schema: {
              type: 'string',
              enum: ['name', 'email', 'role', 'createdAt', 'lastLoginAt'],
              default: 'createdAt',
            },
          },
          {
            in: 'query',
            name: 'direction',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de usuários.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/AdminUser' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Admin · Users'],
        summary: 'Cria usuário',
        description:
          'Requer role **ADMIN**. Se `temporaryPassword` for omitido, é gerado automaticamente.',
        operationId: 'createUser',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/AdminUser' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: {
            description: 'E-mail já cadastrado.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorBody' } },
            },
          },
        },
      },
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Admin · Users'],
        summary: 'Retorna usuário por ID',
        operationId: 'getUser',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Usuário encontrado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/AdminUser' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Admin · Users'],
        summary: 'Atualiza usuário (parcial)',
        operationId: 'updateUser',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } },
          },
        },
        responses: {
          200: { description: 'Usuário atualizado.' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Admin · Users'],
        summary: 'Remove usuário (soft delete)',
        description: 'Não é possível remover o último ADMIN ativo.',
        operationId: 'deleteUser',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Usuário removido.' },
          400: { description: 'Tentativa de remover o último ADMIN ativo.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/users/{id}/reset-password': {
      post: {
        tags: ['Admin · Users'],
        summary: 'Reseta a senha do usuário',
        description:
          'Gera (ou aceita) uma senha temporária e revoga todas as sessões do usuário. ' +
          'Requer role **ADMIN**.',
        operationId: 'resetUserPassword',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } },
          },
        },
        responses: {
          200: { description: 'Senha resetada. Sessões revogadas.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/users/{id}/revoke-sessions': {
      post: {
        tags: ['Admin · Users'],
        summary: 'Revoga todas as sessões do usuário',
        description: 'Requer role **ADMIN**.',
        operationId: 'revokeUserSessions',
        security: [{ bearerAuth: [], csrfHeader: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Sessões revogadas.' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
}
