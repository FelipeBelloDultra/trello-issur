import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { logger } from "@/infra/logger";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";
import { OutboxRepository } from "@/shared/queue/application/repositories/outbox.repository";

// Polls outbox_events for rows written alongside a domain write (see
// DrizzleUnitOfWork) and publishes each one, closing the gap where a crash
// between INSERT and publish() would otherwise drop the event silently.
//
// Runs each tick through the UnitOfWork (not a bare repository call) so
// findPending's row lock (`FOR UPDATE SKIP LOCKED`) actually holds across
// the publish+markPublished sequence — needed for correctness only if
// QueueApp ever runs more than one replica, harmless otherwise.
@injectable()
export class OutboxRelay {
  private intervalHandle: NodeJS.Timeout | null = null;

  public constructor(
    @inject(InjectionTokens.Databases.UnitOfWork)
    private readonly unitOfWork: UnitOfWork,
    @inject(InjectionTokens.Queue.Publisher)
    private readonly publisher: QueuePublisherGateway,
  ) {}

  public start(intervalMs: number): void {
    this.intervalHandle = setInterval(() => {
      this.tick().catch((err: unknown) => {
        logger.error({ err }, "outbox relay tick failed");
      });
    }, intervalMs);
  }

  public stop(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  private async tick(): Promise<void> {
    await this.unitOfWork.execute(async (scope) => {
      const outbox = scope.get<OutboxRepository>(InjectionTokens.Queue.OutboxRepository);
      const pending = await outbox.findPending();

      for (const event of pending) {
        // Deterministic key = the outbox row's own id: if markPublished
        // fails after a successful publish, the next tick republishes the
        // same event under the same key — the consumer's idempotency check
        // recognizes the duplicate instead of processing it twice.
        this.publisher.publish(event.routingKey, event.payload, event.id);
        await outbox.markPublished(event.id);
      }
    });
  }
}
