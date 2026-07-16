import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

export const accounts = pgTable("accounts", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => UniqueEntityID.create().toValue()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
