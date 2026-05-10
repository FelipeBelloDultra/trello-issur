import { UniqueEntityID } from "@/core/entity/unique-entity-id";

export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): UniqueEntityID;
}
