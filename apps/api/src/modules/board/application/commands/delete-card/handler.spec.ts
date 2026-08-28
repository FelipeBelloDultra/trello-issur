import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { makeCard } from "@/test/factories/make-card";
import { InMemoryCardRepository } from "@/test/repositories/in-memory-card.repository";

import { CardNotFoundError } from "../../errors/card-not-found.error";

import { DeleteCardCommand } from "./command";
import { DeleteCardHandler } from "./handler";

describe("DeleteCardHandler", () => {
  let cardRepository: InMemoryCardRepository;
  let sut: DeleteCardHandler;

  beforeEach(() => {
    cardRepository = new InMemoryCardRepository();
    sut = new DeleteCardHandler(cardRepository);
  });

  it("deletes an existing card", async () => {
    const card = makeCard();
    cardRepository.items.push(card);

    const result = await sut.execute(new DeleteCardCommand(card.id.toValue()));

    expect(result.isRight()).toBe(true);
    expect(cardRepository.items).toHaveLength(0);
  });

  it("returns CardNotFoundError when the card does not exist", async () => {
    const result = await sut.execute(new DeleteCardCommand(UniqueEntityID.create().toValue()));

    expect(result.value).toBeInstanceOf(CardNotFoundError);
  });
});
