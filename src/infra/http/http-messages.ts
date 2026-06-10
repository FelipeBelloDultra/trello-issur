export const HttpMessages = {
  General: {
    InternalServerError: "internal server error",
    ValidationFailed: "validation failed",
    Forbidden: "forbidden",
  },
  Auth: {
    Unauthorized: "unauthorized",
    MissingRefreshToken: "missing refresh token",
    InvalidCredentials: "invalid credentials",
    InvalidToken: "invalid or expired token",
  },
  Account: {
    NotFound: "account not found",
    EmailAlreadyTaken: "email already taken",
  },
  Workspace: {
    NotFound: "workspace not found",
    SlugAlreadyTaken: "workspace slug already taken",
  },
  WorkspaceMember: {
    NotFound: "workspace member not found",
    CannotRemoveOwner: "workspace owner cannot be removed",
    CannotUpdateOwnerRole: "workspace owner role cannot be changed",
  },
  WorkspaceInvite: {
    NotFound: "invite not found",
    AlreadyPending: "there is already a pending invite for this email",
    AlreadyUsed: "invite has already been used",
    Expired: "invite has expired",
    EmailMismatch: "this invite was not sent to your email address",
    AlreadyAMember: "account is already a member of this workspace",
  },
  Upload: {
    NoFile: "no file uploaded",
  },
} as const;
