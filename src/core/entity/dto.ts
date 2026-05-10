export abstract class DTO<Props> {
  protected props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }
}
