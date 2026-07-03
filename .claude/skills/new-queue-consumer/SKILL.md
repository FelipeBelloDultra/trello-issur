---
name: new-queue-consumer
description: Scaffold a new RabbitMQ queue consumer for a module in this repo — idempotent, DLX-backed retries, wired into DI and the ConsumerRegistry. Use when asked to add/create a new queue consumer, react to a queue event, or "listen to <event>" for a module.
---

# New queue consumer

Scaffolds a consumer that follows this repo's established pattern: extends `QueueConsumer`, gets DLX-backed staged retries and Valkey idempotency for free, and is wired into the owning module's DI container + `ConsumerRegistry`. See `CLAUDE.md` → "Queue / event-driven design" for the underlying design rationale.

## Steps

1. **Confirm/add the event key.** Routing keys live in `src/shared/queue/application/events.ts` under `QueueEvents.<Domain>.<Event>`. Convention: `"kebab-domain.kebab-event"` (e.g. `"workspace-member.removed"`). Queue name == routing key by convention — don't invent a different queue name.
   - If reacting to an event published by a *different* module, only import the shared `QueueEvents` key and define a local payload interface with the fields you actually need — never import another module's domain/application internals.

2. **Create the consumer** at `src/modules/<module>/infra/queue/consumers/<event-name>.consumer.ts`:

   ```ts
   import { inject, injectable } from "tsyringe";

   import { CommandBus } from "@/core/commands/command-bus";
   import { InjectionTokens } from "@/infra/container/tokens";
   import { QueueConsumer, QueueConsumerConfig } from "@/infra/queue/adapters/rabbitmq/consumer";
   import { Exchanges } from "@/infra/queue/adapters/rabbitmq/exchanges";
   import { <SomeCommand> } from "@/modules/<module>/application/commands/<use-case>/command";
   import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
   import { QueueEvents } from "@/shared/queue/application/events";

   interface <Event>Payload {
     // only the fields this consumer needs
   }

   @injectable()
   export class <Event>Consumer extends QueueConsumer<<Event>Payload> {
     protected readonly config: QueueConsumerConfig = {
       exchange: Exchanges.Main,
       queue: QueueEvents.<Domain>.<Event>,
       routingKey: QueueEvents.<Domain>.<Event>,
       // retryDelays: [5_000, 30_000, 300_000] // optional override; defaults to 5s / 30s / 5min
     };

     public constructor(
       @inject(InjectionTokens.Bus.Command)
       private readonly commandBus: CommandBus,
       @inject(InjectionTokens.Cache.Repository)
       cache: CacheRepository,
     ) {
       super(cache);
     }

     public async handle(payload: <Event>Payload): Promise<void> {
       await this.commandBus.dispatch<void>(new <SomeCommand>({ /* ... */ }));
     }
   }
   ```

   Rules:
   - Dispatch a command for anything that mutates state — don't call a repository/gateway directly from the consumer. That keeps the same validation and three-tier error handling as an HTTP-triggered write. Direct repository/gateway calls are acceptable only for pure reads.
   - Let `handle()` throw on failure — that's what drives the retry/DLX flow. Don't swallow errors inside `handle()`.
   - Never override `start()` or reimplement idempotency/retry/ack logic — `QueueConsumer` already handles idempotency (Valkey, 24h TTL, fail-open on cache errors), staged retries (DLX), and acking.

3. **Add a DI token** in `src/infra/container/tokens.ts` under `Consumers`: `<Event>: Symbol("<Event>Consumer")`.

4. **Register the consumer** in the module's `infra/queue/container.ts` (create it if the module doesn't have one yet — copy the shape of `src/modules/account/infra/queue/container.ts`):

   ```ts
   container.register<<Event>Consumer>(
     InjectionTokens.Consumers.<Event>,
     { useClass: <Event>Consumer },
     { lifecycle: Lifecycle.Singleton },
   );

   const registry = container.resolve<ConsumerRegistry>(InjectionTokens.Queue.ConsumerRegistry);
   registry.register(container.resolve<<Event>Consumer>(InjectionTokens.Consumers.<Event>));
   ```

   Then make sure the module's top-level `infra/container.ts` (`setup<Module>Module()`) calls `setupQueue<Module>Container()` alongside its other `setup*Container()` calls — same spot the other concerns (db, cache, http) are wired.

5. **If this is a brand-new event** (not consuming an existing one), locate or add the publisher side: a command handler calling `this.publisher.publish(QueueEvents.<Domain>.<Event>, payload)` through `QueuePublisherGateway` (pattern: `src/modules/account/application/commands/create-account/handler.ts`). Confirm the payload shape matches what the consumer expects.

6. **Verify**: `pnpm run typecheck`, then `docker compose up -d` and `pnpm run dev:queue` in one terminal, trigger the publishing action, and confirm the consumer acks on success. Optionally force a handler failure to confirm the message lands in `<queue>.retry.1` and eventually `<queue>.dead` after exhausting retries.

## Non-goals

- Don't hand-roll idempotency keys, DLX topology, or manual ack/nack logic — all of it lives in `QueueConsumer` (`src/infra/queue/adapters/rabbitmq/consumer.ts`).
- Don't add the consumer under `src/infra/queue/` — that directory is generic adapter/framework code shared by every consumer. Consumers are module-owned and live under `src/modules/<module>/infra/queue/consumers/`.
