export abstract class DomainError extends Error {
  public abstract readonly code: string;

  public constructor(message: string) {
    super(message);
  }
}
