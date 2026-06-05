export const HttpMessages = {
  General: {
    InternalServerError: "internal server error",
    ValidationFailed: "validation failed",
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
  Upload: {
    NoFile: "no file uploaded",
  },
} as const;
