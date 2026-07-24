export interface QueuePublisherGateway {
  // idempotencyKey defaults to a fresh random one per call when omitted —
  // pass a deterministic value (e.g. the outbox row's own id) for anything
  // that might be republished on retry, so a retry replays as the same
  // logical publish instead of minting a new key the consumer's dedup
  // check has never seen.
  publish<TPayload>(routingKey: string, payload: TPayload, idempotencyKey?: string): void;
}
