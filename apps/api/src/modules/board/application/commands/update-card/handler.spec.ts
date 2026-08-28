import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeCard } from "@/test/factories/make-card";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";

import { CardNotFoundError } from "../../errors/card-not-found.error";

import { UpdateCardCommand } from "./command";
import { UpdateCardHandler } from "./handler";

describe("UpdateCardHandler", () => {
  let cardRepository: InMemoryCardRepository;
  let sut: UpdateCardHandler;

  beforeEach(() => {
    cardRepository = new InMemoryCardRepository();
    sut = new UpdateCardHandler(cardRepository);
  });

  it("updates title/description without changing column or position", async () => {
    const card = makeCard();
    cardRepository.items.push(card);
    const originalColumnId = card.columnId;
    const originalPosition = card.position.toNumber();

    const result = await sut.execute(
      new UpdateCardCommand({ cardId: card.id.toValue(), title: "New title" }),
    );

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items[0].title.toString()).toBe("New title");
    expect(cardRepository.items[0].columnId.equals(originalColumnId)).toBe(true);
    expect(cardRepository.items[0].position.toNumber()).toBe(originalPosition);
  });

  it("returns CardNotFoundError when the card does not exist", async () => {
    const result = await sut.execute(
      new UpdateCardCommand({ cardId: UniqueEntityID.create().toValue(), title: "X" }),
    );

    expect(result.value).toBeInstanceOf(CardNotFoundError);
  });
});
