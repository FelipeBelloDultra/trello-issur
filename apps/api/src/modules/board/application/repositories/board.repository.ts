import { Board } from "@/modules/board/domain/entities/board";

export interface BoardRepository {
  create(board: Board): Promise<void>;
  save(board: Board): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Board | null>;
  findAllByWorkspaceId(workspaceId: string): Promise<Board[]>;
}
