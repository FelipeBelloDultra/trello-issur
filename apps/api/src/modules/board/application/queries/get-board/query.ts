import { Query } from "@/core/queries/query";

export class GetBoardQuery implements Query {
  public constructor(public readonly boardId: string) {}
}
