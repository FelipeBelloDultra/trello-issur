import { UniqueEntityID } from "@/core/entity/unique-entity-id";

export abstract class Entity<Props = unknown> {
  private _id: UniqueEntityID;
  protected props: Props;

  public get id() {
    return this._id;
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this.props = props;
    this._id = id ?? UniqueEntityID.create();
  }

  public equals(entity: Entity<unknown>) {
    if (entity === this) {
      return true;
    }

    if (entity.id.equals(this._id)) {
      return true;
    }

    return false;
  }
}
