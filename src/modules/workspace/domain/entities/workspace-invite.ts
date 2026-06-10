import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { InviteExpiry } from "../value-objects/invite-expiry";
import {
  WorkspaceInviteStatus,
  WorkspaceInviteStatuses,
} from "../value-objects/workspace-invite-status";
import { WorkspaceMemberRole } from "../value-objects/workspace-member-role";

interface WorkspaceInviteProps {
  workspaceId: UniqueEntityID;
  invitedByAccountId: UniqueEntityID;
  email: string;
  role: WorkspaceMemberRole;
  token: string;
  status: WorkspaceInviteStatus;
  expiresAt: InviteExpiry;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkspaceInvite extends Entity<WorkspaceInviteProps> {
  public get workspaceId(): UniqueEntityID {
    return this.props.workspaceId;
  }

  public get invitedByAccountId(): UniqueEntityID {
    return this.props.invitedByAccountId;
  }

  public get email(): string {
    return this.props.email;
  }

  public get role(): WorkspaceMemberRole {
    return this.props.role;
  }

  public get token(): string {
    return this.props.token;
  }

  public get status(): WorkspaceInviteStatus {
    return this.props.status;
  }

  public get expiresAt(): InviteExpiry {
    return this.props.expiresAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isPending(): boolean {
    return this.props.status === WorkspaceInviteStatuses.Pending;
  }

  public isExpired(): boolean {
    return this.props.expiresAt.isExpired();
  }

  public accept(): void {
    this.props.status = WorkspaceInviteStatuses.Accepted;
    this.touch();
  }

  public reject(): void {
    this.props.status = WorkspaceInviteStatuses.Rejected;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private constructor(props: WorkspaceInviteProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: WorkspaceInviteProps, id?: UniqueEntityID): WorkspaceInvite {
    return new WorkspaceInvite(props, id);
  }
}
