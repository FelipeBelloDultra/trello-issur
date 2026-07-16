import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { WorkspaceMemberRole, WorkspaceMemberRoles } from "../value-objects/workspace-member-role";

interface WorkspaceMemberProps {
  workspaceId: UniqueEntityID;
  accountId: UniqueEntityID;
  role: WorkspaceMemberRole;
  createdAt: Date;
}

export class WorkspaceMember extends Entity<WorkspaceMemberProps> {
  public get workspaceId(): UniqueEntityID {
    return this.props.workspaceId;
  }

  public get accountId(): UniqueEntityID {
    return this.props.accountId;
  }

  public get role(): WorkspaceMemberRole {
    return this.props.role;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public isOwner(): boolean {
    return this.props.role === WorkspaceMemberRoles.Owner;
  }

  private constructor(props: WorkspaceMemberProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: WorkspaceMemberProps, id?: UniqueEntityID): WorkspaceMember {
    return new WorkspaceMember(props, id);
  }
}
