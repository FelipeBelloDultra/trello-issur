import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

export const permissions = pgTable("permissions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => UniqueEntityID.create().toValue()),
  key: text("key").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
