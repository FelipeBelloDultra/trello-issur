export const InjectionTokens = {
  Databases: {
    Drizzle: Symbol("Database"),
    Valkey: Symbol("ValkeyClient"),
  },

  Cache: {
    Repository: Symbol("CacheRepository"),
  },

  Repositories: {
    User: Symbol("UserRepository"),
    Token: Symbol("TokenRepository"),
  },

  Gateways: {
    Cryptograph: Symbol("CryptographGateway"),
  },

  Bus: {
    Command: Symbol("CommandBus"),
    Query: Symbol("QueryBus"),
  },

  Handlers: {
    Login: Symbol("LoginHandler"),
    Logout: Symbol("LogoutHandler"),
    RefreshToken: Symbol("RefreshTokenHandler"),
    RegisterUser: Symbol("RegisterUserHandler"),
  },

  Controllers: {
    RegisterUser: Symbol("RegisterUserController"),
    Login: Symbol("LoginController"),
    RefreshToken: Symbol("RefreshTokenController"),
    Logout: Symbol("LogoutController"),
  },

  Middlewares: {
    RateLimit: Symbol("RateLimitMiddleware"),
    Logger: Symbol("LoggerMiddleware"),
    Tracing: Symbol("TracingMiddleware"),
    Metrics: Symbol("MetricsMiddleware"),
  },
} as const;
