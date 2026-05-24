export const InjectionTokens = {
  Databases: {
    Drizzle: Symbol("Database"),
    Valkey: Symbol("ValkeyClient"),
  },

  Cache: {
    Repository: Symbol("CacheRepository"),
  },

  Repositories: {
    Account: Symbol("AccountRepository"),
    Token: Symbol("TokenRepository"),
    AccountRole: Symbol("AccountRoleRepository"),
  },

  Gateways: {
    Cryptograph: Symbol("CryptographGateway"),
  },

  Bus: {
    Command: Symbol("CommandBus"),
    Query: Symbol("QueryBus"),
  },

  Queue: {
    Client: Symbol("RabbitMQClient"),
    Publisher: Symbol("QueuePublisher"),
    ConsumerRegistry: Symbol("ConsumerRegistry"),
  },

  Handlers: {
    Authenticate: Symbol("AuthenticateHandler"),
    Logout: Symbol("LogoutHandler"),
    RefreshToken: Symbol("RefreshTokenHandler"),
    CreateAccount: Symbol("CreateAccountHandler"),
    GetAccount: Symbol("GetAccountHandler"),
  },

  Controllers: {
    CreateAccount: Symbol("CreateAccountController"),
    Authenticate: Symbol("AuthenticateController"),
    RefreshToken: Symbol("RefreshTokenController"),
    Logout: Symbol("LogoutController"),
    GetMe: Symbol("GetMeController"),
  },

  Middlewares: {
    Auth: Symbol("AuthMiddleware"),
    Authorize: Symbol("AuthorizeMiddleware"),
    ValidateWorkspace: Symbol("ValidateWorkspaceMiddleware"),
    RateLimit: Symbol("RateLimitMiddleware"),
    Logger: Symbol("LoggerMiddleware"),
    Tracing: Symbol("TracingMiddleware"),
    Metrics: Symbol("MetricsMiddleware"),
  },
} as const;
