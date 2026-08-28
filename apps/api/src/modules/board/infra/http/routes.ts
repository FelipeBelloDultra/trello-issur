import { InjectionTokens } from "@/infra/container/tokens";

export const boardControllers = [
  InjectionTokens.Controllers.CreateBoard,
  InjectionTokens.Controllers.RenameBoard,
  InjectionTokens.Controllers.DeleteBoard,
  InjectionTokens.Controllers.ListWorkspaceBoards,
  InjectionTokens.Controllers.GetBoard,
  InjectionTokens.Controllers.CreateColumn,
  InjectionTokens.Controllers.MoveColumn,
  InjectionTokens.Controllers.DeleteColumn,
  InjectionTokens.Controllers.CreateCard,
  InjectionTokens.Controllers.UpdateCard,
  InjectionTokens.Controllers.MoveCard,
  InjectionTokens.Controllers.AssignCard,
  InjectionTokens.Controllers.DeleteCard,
];
