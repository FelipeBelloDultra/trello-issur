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

  Storage: {
    Gateway: Symbol("StorageGateway"),
    Lifecycle: Symbol("StorageLifecycle"),
  },

  Gateways: {
    Cryptograph: Symbol("CryptographGateway"),
    PasswordHasher: Symbol("PasswordHasherGateway"),
    SendWelcomeEmail: Symbol("SendWelcomeEmailGateway"),
  },

  Consumers: {
    AccountCreated: Symbol("AccountCreatedConsumer"),
    WorkspacePersonalCreationRequested: Symbol("WorkspacePersonalCreationRequestedConsumer"),
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
    UpdateWorkspaceAvatar: Symbol("UpdateWorkspaceAvatarHandler"),
  },

  Controllers: {
    CreateAccount: Symbol("CreateAccountController"),
    Authenticate: Symbol("AuthenticateController"),
    RefreshToken: Symbol("RefreshTokenController"),
    Logout: Symbol("LogoutController"),
    GetMe: Symbol("GetMeController"),
    CreateWorkspace: Symbol("CreateWorkspaceController"),
    GetWorkspace: Symbol("GetWorkspaceController"),
    UpdateWorkspaceAvatar: Symbol("UpdateWorkspaceAvatarController"),
  },

  Middlewares: {
    ErrorHandler: Symbol("ErrorHandlerMiddleware"),
    Auth: Symbol("AuthMiddleware"),
    Authorize: Symbol("AuthorizeMiddleware"),
    ValidateWorkspace: Symbol("ValidateWorkspaceMiddleware"),
    FileUpload: Symbol("FileUploadMiddleware"),
    RateLimit: Symbol("RateLimitMiddleware"),
    Logger: Symbol("LoggerMiddleware"),
    Tracing: Symbol("TracingMiddleware"),
    Metrics: Symbol("MetricsMiddleware"),
  },
} as const;
