import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const permissions = pgTable("permissions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  key: text("key").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
