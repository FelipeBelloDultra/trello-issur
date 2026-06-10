import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { Pagination } from "@/core/entity/pagination";
import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { notifications } from "@/infra/db/schema/notifications";

import {
  CreateNotificationOptions,
  NotificationRepository,
  NotificationView,
} from "../../../application/repositories/notification.repository";
import { Notification } from "../../../domain/entities/notification";
import { NotificationMapper } from "../mappers/notification.mapper";

@injectable()
export class DrizzleNotificationRepository implements NotificationRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public async create(options: CreateNotificationOptions): Promise<void> {
    await this.db.query.insert(notifications).values({
      accountId: options.accountId,
      type: options.type,
      title: options.title,
      body: options.body,
      metadata: options.metadata,
    });
  }

  public async findById(id: string): Promise<Notification | null> {
    const [row] = await this.db.query
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    if (!row) return null;

    return NotificationMapper.toDomain(row);
  }

  public async findManyByAccount(
    accountId: string,
    pagination: Pagination,
    read?: boolean,
  ): Promise<{ notifications: NotificationView[]; total: number }> {
    const readFilter =
      read === true
        ? isNotNull(notifications.readAt)
        : read === false
          ? isNull(notifications.readAt)
          : undefined;

    const baseWhere = and(eq(notifications.accountId, accountId), readFilter);

    const [rows, countResult] = await Promise.all([
      this.db.query
        .select()
        .from(notifications)
        .where(baseWhere)
        .orderBy(asc(notifications.createdAt))
        .limit(pagination.take)
        .offset(pagination.skip),
      this.db.query
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(baseWhere),
    ]);

    return {
      notifications: rows as NotificationView[],
      total: countResult[0]?.count ?? 0,
    };
  }

  public async save(notification: Notification): Promise<void> {
    const { id, ...data } = NotificationMapper.toPersistence(notification);
    await this.db.query.update(notifications).set(data).where(eq(notifications.id, id));
  }

  public async markAllAsReadByAccount(accountId: string): Promise<void> {
    await this.db.query
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.accountId, accountId), isNull(notifications.readAt)));
  }
}
