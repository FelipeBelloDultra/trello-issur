import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceInviteRepository } from "@/modules/workspace/application/repositories/workspace-invite.repository";
import { WorkspaceMemberRepository } from "@/modules/workspace/application/repositories/workspace-member.repository";
import { WorkspaceRepository } from "@/modules/workspace/application/repositories/workspace.repository";

import { DrizzleWorkspaceInviteRepository } from "./repositories/drizzle-workspace-invite.repository";
import { DrizzleWorkspaceMemberRepository } from "./repositories/drizzle-workspace-member.repository";
import { DrizzleWorkspaceRepository } from "./repositories/drizzle-workspace.repository";

export function setupDatabaseWorkspaceContainer(): void {
  container.register<WorkspaceRepository>(
    InjectionTokens.Repositories.Workspace,
    { useClass: DrizzleWorkspaceRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<WorkspaceMemberRepository>(
    InjectionTokens.Repositories.WorkspaceMember,
    { useClass: DrizzleWorkspaceMemberRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  // Deliberately NOT Singleton — built against DrizzleExecutor, which a
  // UnitOfWork overrides per-transaction in a child container (see
  // infra/db/unit-of-work.ts and the account module's equivalent comment).
  container.register<WorkspaceInviteRepository>(InjectionTokens.Repositories.WorkspaceInvite, {
    useClass: DrizzleWorkspaceInviteRepository,
  });
}
