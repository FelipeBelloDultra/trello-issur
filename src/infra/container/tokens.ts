export const InjectionTokens = {
  Databases: {
    Drizzle: Symbol("Database"),
    Valkey: Symbol("ValkeyClient"),
  },

  Cache: {
    Repository: Symbol("CacheRepository"),
    Account: Symbol("AccountCacheRepository"),
    AccountRole: Symbol("AccountRoleCacheRepository"),
    WorkspaceMember: Symbol("WorkspaceMemberCacheRepository"),
    WorkspaceInvite: Symbol("WorkspaceInviteCacheRepository"),
  },

  Repositories: {
    Account: Symbol("AccountRepository"),
    Token: Symbol("TokenRepository"),
    AccountRole: Symbol("AccountRoleRepository"),
    Workspace: Symbol("WorkspaceRepository"),
    WorkspaceMember: Symbol("WorkspaceMemberRepository"),
    WorkspaceInvite: Symbol("WorkspaceInviteRepository"),
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
    TokenGenerator: Symbol("TokenGeneratorGateway"),
  },

  Consumers: {
    AccountCreated: Symbol("AccountCreatedConsumer"),
    WorkspacePersonalCreationRequested: Symbol("WorkspacePersonalCreationRequestedConsumer"),
    WorkspaceInviteCreated: Symbol("WorkspaceInviteCreatedConsumer"),
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
    ListWorkspaceMembers: Symbol("ListWorkspaceMembersHandler"),
    RemoveWorkspaceMember: Symbol("RemoveWorkspaceMemberHandler"),
    UpdateWorkspaceMemberRole: Symbol("UpdateWorkspaceMemberRoleHandler"),
    InviteMember: Symbol("InviteMemberHandler"),
    RespondToInvite: Symbol("RespondToInviteHandler"),
    ListWorkspaceInvites: Symbol("ListWorkspaceInvitesHandler"),
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
    ListWorkspaceMembers: Symbol("ListWorkspaceMembersController"),
    RemoveWorkspaceMember: Symbol("RemoveWorkspaceMemberController"),
    UpdateWorkspaceMemberRole: Symbol("UpdateWorkspaceMemberRoleController"),
    InviteMember: Symbol("InviteMemberController"),
    RespondToInvite: Symbol("RespondToInviteController"),
    ListWorkspaceInvites: Symbol("ListWorkspaceInvitesController"),
  },

  Middlewares: {
    ErrorHandler: Symbol("ErrorHandlerMiddleware"),
    Auth: Symbol("AuthMiddleware"),
    Authorize: Symbol("AuthorizeMiddleware"),
    ValidateWorkspace: Symbol("ValidateWorkspaceMiddleware"),
    FileUpload: Symbol("FileUploadMiddleware"),
    Pagination: Symbol("PaginationMiddleware"),
    RateLimit: Symbol("RateLimitMiddleware"),
    Logger: Symbol("LoggerMiddleware"),
    Tracing: Symbol("TracingMiddleware"),
    Metrics: Symbol("MetricsMiddleware"),
  },
} as const;
