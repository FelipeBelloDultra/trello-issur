import { CardRepository } from "@/modules/board/application/repositories/card.repository";
import { Card } from "@/modules/board/domain/entities/card";

export class InMemoryCardRepository implements CardRepository {
  public readonly items: Card[] = [];

  public async create(card: Card): Promise<void> {
    await Promise.resolve(this.items.push(card));
  }

  public async save(card: Card): Promise<void> {
    const index = this.items.findIndex((c) => c.id.equals(card.id));
    if (index >= 0) this.items[index] = card;
    return Promise.resolve();
  }

  public async delete(id: string): Promise<void> {
    const index = this.items.findIndex((c) => c.id.toValue() === id);
    if (index >= 0) this.items.splice(index, 1);
    return Promise.resolve();
  }

  public async deleteAllByBoardId(boardId: string): Promise<void> {
    let index = this.items.findIndex((c) => c.boardId.toValue() === boardId);
    while (index >= 0) {
      this.items.splice(index, 1);
      index = this.items.findIndex((c) => c.boardId.toValue() === boardId);
    }
    return Promise.resolve();
  }

  public async deleteAllByColumnId(columnId: string): Promise<void> {
    let index = this.items.findIndex((c) => c.columnId.toValue() === columnId);
    while (index >= 0) {
      this.items.splice(index, 1);
      index = this.items.findIndex((c) => c.columnId.toValue() === columnId);
    }
    return Promise.resolve();
  }

  public async findById(id: string): Promise<Card | null> {
    const card = this.items.find((c) => c.id.toValue() === id);
    return Promise.resolve(card ?? null);
  }

  public async findAllByColumnId(columnId: string): Promise<Card[]> {
    const cards = this.items
      .filter((c) => c.columnId.toValue() === columnId)
      .sort((a, b) => a.position.toNumber() - b.position.toNumber());
    return Promise.resolve(cards);
  }

  public async findAllByBoardId(boardId: string): Promise<Card[]> {
    const cards = this.items
      .filter((c) => c.boardId.toValue() === boardId)
      .sort((a, b) => a.position.toNumber() - b.position.toNumber());
    return Promise.resolve(cards);
  }

  public async findLastPositionByColumnId(columnId: string): Promise<number | null> {
    const cards = await this.findAllByColumnId(columnId);
    if (cards.length === 0) return null;
    return cards[cards.length - 1].position.toNumber();
  }
}
