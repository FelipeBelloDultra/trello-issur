import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

export const failedQueueEvents = pgTable("failed_queue_events", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => UniqueEntityID.create().toValue()),
  queue: text("queue").notNull(),
  exchange: text("exchange").notNull(),
  routingKey: text("routing_key").notNull(),
  payload: jsonb("payload").notNull(),
  errorMessage: text("error_message").notNull(),
  retryCount: integer("retry_count").notNull().default(0),
  firstFailedAt: timestamp("first_failed_at").notNull(),
  deadAt: timestamp("dead_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
