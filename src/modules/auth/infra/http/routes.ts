import { InjectionTokens } from "@/infra/container/tokens";

export const authControllers = [
  InjectionTokens.Controllers.Authenticate,
  InjectionTokens.Controllers.Logout,
  InjectionTokens.Controllers.RefreshToken,
  InjectionTokens.Controllers.GetMe,
];
