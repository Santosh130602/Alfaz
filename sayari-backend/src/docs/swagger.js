'use strict';

const swaggerJsdoc     = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');

// ─────────────────────────────────────────────
//  SWAGGER DEFINITION
// ─────────────────────────────────────────────

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title      : 'Sayari Platform API',
    version    : '1.0.0',
    description: 'Complete REST API for the Sayari poetry, story and audio platform.\n\n**Authentication:** Bearer JWT token in Authorization header.\n\n**Base URL:** `/api/v1`',
    contact    : { name: 'Sayari Support', email: 'support@sayari.app' },
  },
  servers: [
    { url: '/api/v1', description: 'Current server' },
    { url: 'https://api.sayari.app/api/v1', description: 'Production' },
    { url: 'http://localhost:4000/api/v1', description: 'Local development' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type  : 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description : 'Access token from /auth/login or /auth/refresh',
      },
    },
    schemas: {
      // ── Common ──────────────────────────────
      SuccessResponse: {
        type      : 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string',  example: 'Success' },
          data   : { type: 'object' },
        },
      },
      ErrorResponse: {
        type      : 'object',
        properties: {
          success: { type: 'boolean', example: false },
          code   : { type: 'string',  example: 'VALIDATION_ERROR' },
          message: { type: 'string',  example: 'Email is required' },
        },
      },
      Pagination: {
        type      : 'object',
        properties: {
          page : { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          pages: { type: 'integer', example: 5 },
        },
      },
      // ── User ────────────────────────────────
      UserPublic: {
        type      : 'object',
        properties: {
          _id        : { type: 'string',  example: '64a1b2c3d4e5f6789abc1234' },
          username   : { type: 'string',  example: 'faiz_ahmed' },
          displayName: { type: 'string',  example: 'Faiz Ahmed' },
          avatar     : { type: 'object',  properties: { url: { type: 'string' }, thumbnail: { type: 'string' } } },
          bio        : { type: 'string',  example: 'Shayar hoon, lafzon ka karobaar karta hoon' },
          isVerified : { type: 'boolean', example: true },
          badges     : { type: 'array',   items: { type: 'object' } },
          stats      : { type: 'object',  properties: { followersCount: { type: 'integer' }, followingCount: { type: 'integer' }, postsCount: { type: 'integer' } } },
          createdAt  : { type: 'string',  format: 'date-time' },
        },
      },
      // ── Auth ────────────────────────────────
      TokenPair: {
        type      : 'object',
        properties: {
          accessToken : { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      // ── Post ────────────────────────────────
      Post: {
        type      : 'object',
        properties: {
          _id          : { type: 'string' },
          type         : { type: 'string', enum: ['sayari','kavita','ghazal','nazm','story_chapter','book_chapter','audio','quote'] },
          title        : { type: 'string' },
          status       : { type: 'string', enum: ['draft','published','scheduled','archived'] },
          visibility   : { type: 'string', enum: ['public','private','followers_only'] },
          renderedImage: { type: 'object', properties: { url: { type: 'string' }, thumbnail: { type: 'string' } } },
          stats        : { type: 'object', properties: { viewCount: { type: 'integer' }, likeCount: { type: 'integer' }, commentCount: { type: 'integer' } } },
          author       : { $ref: '#/components/schemas/UserPublic' },
          publishedAt  : { type: 'string', format: 'date-time' },
          language     : { type: 'string', enum: ['ur','hi','en','mixed'] },
          mood         : { type: 'array', items: { type: 'string' } },
          tags         : { type: 'array', items: { type: 'string' } },
        },
      },
      // ── Channel ─────────────────────────────
      Channel: {
        type      : 'object',
        properties: {
          _id        : { type: 'string' },
          handle     : { type: 'string', example: 'faiz_ahmed' },
          name       : { type: 'string', example: 'Faiz ki Duniya' },
          tagline    : { type: 'string', example: 'Lafzon ka safar' },
          logo       : { type: 'object', properties: { url: { type: 'string' }, thumbnail: { type: 'string' } } },
          isVerified : { type: 'boolean' },
          stats      : { type: 'object', properties: { followersCount: { type: 'integer' }, postsCount: { type: 'integer' } } },
        },
      },
    },
    // ── Reusable parameters ──────────────────
    parameters: {
      pageParam : { name: 'page',  in: 'query', schema: { type: 'integer', default: 1,  minimum: 1 } },
      limitParam: { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 50 } },
      periodParam: { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d','30d','90d','1y'], default: '30d' } },
    },
    // ── Reusable responses ───────────────────
    responses: {
      UnauthorizedError: {
        description: 'JWT token missing or invalid',
        content    : { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      NotFoundError: {
        description: 'Resource not found',
        content    : { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      ValidationError: {
        description: 'Input validation failed',
        content    : { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      RateLimitError: {
        description: 'Too many requests',
        content    : { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: 'Auth',          description: 'Authentication — register, login, OTP, OAuth, tokens' },
    { name: 'Posts',         description: 'Content creation — sayari, kavita, audio, canvas posts' },
    { name: 'Series',        description: 'Chapter-wise story and book series management' },
    { name: 'Templates',     description: 'Canvas background templates (admin managed)' },
    { name: 'Assets',        description: 'Stickers, fonts, logos (admin managed)' },
    { name: 'Engagement',    description: 'Likes, comments, saves, follows, views, reports' },
    { name: 'Feed',          description: 'For you, trending, explore, mood, top creators' },
    { name: 'Search',        description: 'Search posts, channels, series, tags, autocomplete' },
    { name: 'Notifications', description: 'Notification inbox, preferences, device tokens' },
    { name: 'Analytics',     description: 'Creator analytics dashboard — views, followers, engagement' },
    { name: 'Profiles',      description: 'Public user and channel profiles' },
    { name: 'Admin',         description: 'Admin panel — user mgmt, post mgmt, reports, announcements' },
    { name: 'System',        description: 'Webhooks, platform config, health checks' },
  ],
};

// ─────────────────────────────────────────────
//  SWAGGER OPTIONS
// ─────────────────────────────────────────────

const options = {
  swaggerDefinition,
  // Scan these files for @swagger JSDoc annotations
  apis: [
    './src/routes/*.js',
    './src/modules/**/*.js',
    './src/docs/*.yaml',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// ─────────────────────────────────────────────
//  SETUP FUNCTION
//  Mounts Swagger UI at /api/docs
// ─────────────────────────────────────────────

function setupSwagger(app) {
  const swaggerUiOptions = {
    explorer         : true,
    customSiteTitle  : 'Sayari Platform API Docs',
    customfavIcon    : '/favicon.ico',
    customCss        : `
      .swagger-ui .topbar { background-color: #6C63FF; }
      .swagger-ui .topbar-wrapper .link span { display: none; }
      .swagger-ui .topbar-wrapper::after { content: 'Sayari Platform API'; color: white; font-size: 18px; font-weight: bold; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion : 'none',
      filter       : true,
      tagsSorter   : 'alpha',
    },
  };

  // Serve Swagger UI
  app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec, swaggerUiOptions));

  // Serve raw OpenAPI JSON (for Postman import, code generation, etc.)
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 API Docs available at /api/docs`);
}

module.exports = { setupSwagger, swaggerSpec };
