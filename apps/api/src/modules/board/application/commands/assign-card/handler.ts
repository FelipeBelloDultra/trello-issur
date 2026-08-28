import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { AccountRoleRepository } from "@/modules/auth/application/repositories/account-role.repository";
import { Card } from "@/modules/board/domain/entities/card";

import { AccountNotWorkspaceMemberError } from "../../errors/account-not-workspace-member.error";
import { BoardNotFoundError } from "../../errors/board-not-found.error";
import { CardNotFoundError } from "../../errors/card-not-found.error";
import { BoardRepository } from "../../repositories/board.repository";
import { CardRepository } from "../../repositories/card.repository";

import { AssignCardCommand } from "./command";

type OnError = CardNotFoundError | BoardNotFoundError | AccountNotWorkspaceMemberError;
type OnSuccess = { card: Card };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class AssignCardHandler implements CommandHandler<
  AssignCardCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.Card)
    private readonly cardRepository: CardRepository,
    @inject(InjectionTokens.Repositories.Board)
    private readonly boardRepository: BoardRepository,
    @inject(InjectionTokens.Repositories.AccountRole)
    private readonly accountRoleRepository: AccountRoleRepository,
  ) {}

  public async execute(command: AssignCardCommand): Output {
    const card = await this.cardRepository.findById(command.props.cardId);

    if (!card) return left(new CardNotFoundError());

    if (command.props.assigneeAccountId === null) {
      card.assignTo(null);
      await this.cardRepository.save(card);

      return right({ card });
    }

    const board = await this.boardRepository.findById(card.boardId.toValue());

    if (!board) return left(new BoardNotFoundError());

    const isMember = await this.accountRoleRepository.isMember(
      command.props.assigneeAccountId,
      board.workspaceId.toValue(),
    );

    if (!isMember) return left(new AccountNotWorkspaceMemberError());

    card.assignTo(UniqueEntityID.create(command.props.assigneeAccountId));
    await this.cardRepository.save(card);

    return right({ card });
  }
}
