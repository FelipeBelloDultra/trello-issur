import { doublePrecision, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { accounts } from "./accounts";
import { boards } from "./boards";
import { columns } from "./columns";

export const cards = pgTable(
  "cards",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => UniqueEntityID.create().toValue()),
    columnId: uuid("column_id")
      .notNull()
      // See columns.ts — cascade delete is app-level (UnitOfWork), not DB-level.
      .references(() => columns.id, { onDelete: "restrict" }),
    // Denormalized copy of the owning column's board id — lets MoveCard reject
    // a cross-board move (FR-007) with two single-row reads instead of a join
    // through columns. Kept in sync by MoveCardHandler whenever columnId
    // changes. See data-model.md → Card → "Why board_id is denormalized".
    boardId: uuid("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    position: doublePrecision("position").notNull(),
    assigneeAccountId: uuid("assignee_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("cards_column_id_position_idx").on(table.columnId, table.position)],
);
