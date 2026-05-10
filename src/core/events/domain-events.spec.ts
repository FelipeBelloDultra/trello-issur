import { vi } from "vitest";

import { AggregateRoot } from "@/core/entity/aggregate-root";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { DomainEvents } from "@/core/events/domain-events";

import { DomainEvent } from "./domain-event";

class CustomAggregateCreated implements DomainEvent {
  public occurredAt: Date;
  private aggregate: CustomAggregate;

  public constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate;
    this.occurredAt = new Date();
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id;
  }
}

class CustomAggregate extends AggregateRoot<null> {
  public static create() {
    const aggregate = new CustomAggregate(null);

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

    return aggregate;
  }
}

describe("Domain events", () => {
  it("should be able to dispatch and listen to events", () => {
    const callbackSpy = vi.fn();

    DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

    const aggregate = CustomAggregate.create();

    expect(aggregate.domainEvents).toHaveLength(1);

    DomainEvents.dispatchEventsForAggregate(aggregate.id);

    expect(callbackSpy).toHaveBeenCalled();

    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
