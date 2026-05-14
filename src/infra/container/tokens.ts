export const TOKENS = {
  // Infrastructure
  Database: Symbol("Database"),
  ValkeyClient: Symbol("ValkeyClient"),

  // User
  UserRepository: Symbol("UserRepository"),
  RegisterUserUseCase: Symbol("RegisterUserUseCase"),
  RegisterUserController: Symbol("RegisterUserController"),

  // Auth
  CryptographGateway: Symbol("CryptographGateway"),
  TokenRepository: Symbol("TokenRepository"),
  LoginUseCase: Symbol("LoginUseCase"),
  RefreshTokenUseCase: Symbol("RefreshTokenUseCase"),
  LogoutUseCase: Symbol("LogoutUseCase"),
  LoginController: Symbol("LoginController"),
  RefreshTokenController: Symbol("RefreshTokenController"),
  LogoutController: Symbol("LogoutController"),
} as const;
