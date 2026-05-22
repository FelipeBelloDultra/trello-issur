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

  Controllers: {
    RegisterUser: Symbol("RegisterUserController"),
    Login: Symbol("LoginController"),
    RefreshToken: Symbol("RefreshTokenController"),
    Logout: Symbol("LogoutController"),
  },

  UseCases: {
    Login: Symbol("LoginUseCase"),
    RefreshToken: Symbol("RefreshTokenUseCase"),
    Logout: Symbol("LogoutUseCase"),
    RegisterUser: Symbol("RegisterUserUseCase"),
  },

  Middlewares: {
    RateLimit: Symbol("RateLimitMiddleware"),
    Logger: Symbol("LoggerMiddleware"),
    Tracing: Symbol("TracingMiddleware"),
    Metrics: Symbol("MetricsMiddleware"),
  },
} as const;
