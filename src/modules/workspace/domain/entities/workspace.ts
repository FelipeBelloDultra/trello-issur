import { Entity } from "@/core/entity/entity";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";

import { WorkspaceName } from "../value-objects/workspace-name";
import { WorkspaceSlug } from "../value-objects/workspace-slug";

interface WorkspaceProps {
  name: WorkspaceName;
  slug: WorkspaceSlug;
  ownerId: UniqueEntityID;
  description: string | null;
  avatarUrl: string | null;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Workspace extends Entity<WorkspaceProps> {
  public get name(): WorkspaceName {
    return this.props.name;
  }

  public get slug(): WorkspaceSlug {
    return this.props.slug;
  }

  public get ownerId(): UniqueEntityID {
    return this.props.ownerId;
  }

  public get description(): string | null {
    return this.props.description;
  }

  public get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  public get isPersonal(): boolean {
    return this.props.isPersonal;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(props: WorkspaceProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: WorkspaceProps, id?: UniqueEntityID): Workspace {
    return new Workspace(props, id);
  }
}
