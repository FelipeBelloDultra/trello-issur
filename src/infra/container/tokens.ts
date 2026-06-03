export const InjectionTokens = {
  Databases: {
    Drizzle: Symbol("Database"),
    Valkey: Symbol("ValkeyClient"),
  },

  Cache: {
    Repository: Symbol("CacheRepository"),
    Account: Symbol("AccountCacheRepository"),
    AccountRole: Symbol("AccountRoleCacheRepository"),
  },

  Repositories: {
    Account: Symbol("AccountRepository"),
    Token: Symbol("TokenRepository"),
    AccountRole: Symbol("AccountRoleRepository"),
    Workspace: Symbol("WorkspaceRepository"),
    WorkspaceMember: Symbol("WorkspaceMemberRepository"),
  },

  Email: {
    Gateway: Symbol("EmailGateway"),
  },

  Gateways: {
    Cryptograph: Symbol("CryptographGateway"),
    PasswordHasher: Symbol("PasswordHasherGateway"),
    SendWelcomeEmail: Symbol("SendWelcomeEmailGateway"),
  },

  Consumers: {
    AccountCreated: Symbol("AccountCreatedConsumer"),
  },

  Bus: {
    Command: Symbol("CommandBus"),
    Query: Symbol("QueryBus"),
  },

  Queue: {
    Client: Symbol("RabbitMQClient"),
    Publisher: Symbol("QueuePublisher"),
    ConsumerRegistry: Symbol("ConsumerRegistry"),
    DeadLetterConsumer: Symbol("DeadLetterConsumer"),
    DeadLetterRepository: Symbol("DeadLetterRepository"),
  },

  Handlers: {
    Authenticate: Symbol("AuthenticateHandler"),
    Logout: Symbol("LogoutHandler"),
    RefreshToken: Symbol("RefreshTokenHandler"),
    CreateAccount: Symbol("CreateAccountHandler"),
    GetAccount: Symbol("GetAccountHandler"),
    SendWelcomeEmail: Symbol("SendWelcomeEmailHandler"),
    CreateWorkspace: Symbol("CreateWorkspaceHandler"),
    GetWorkspace: Symbol("GetWorkspaceHandler"),
  },

  Controllers: {
    CreateAccount: Symbol("CreateAccountController"),
    Authenticate: Symbol("AuthenticateController"),
    RefreshToken: Symbol("RefreshTokenController"),
    Logout: Symbol("LogoutController"),
    GetMe: Symbol("GetMeController"),
    CreateWorkspace: Symbol("CreateWorkspaceController"),
    GetWorkspace: Symbol("GetWorkspaceController"),
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
