import { doublePrecision, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { boards } from "./boards";

export const columns = pgTable(
  "columns",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => UniqueEntityID.create().toValue()),
    boardId: uuid("board_id")
      .notNull()
      // Board deletion cascades to columns/cards through the shared UnitOfWork
      // (app-level, ordered delete), not a DB-level cascade — see
      // specs/001-board-card-module/data-model.md → Relationships.
      .references(() => boards.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    position: doublePrecision("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("columns_board_id_position_idx").on(table.boardId, table.position)],
);
