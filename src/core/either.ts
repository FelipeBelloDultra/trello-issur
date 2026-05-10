export class Left<L, R> {
  public readonly value: L;

  public constructor(value: L) {
    this.value = value;
  }

  public isRight(): this is Right<L, R> {
    return false;
  }

  public isLeft(): this is Left<L, R> {
    return true;
  }
}

export class Right<L, R> {
  public readonly value: R;

  public constructor(value: R) {
    this.value = value;
  }

  public isRight(): this is Right<L, R> {
    return true;
  }

  public isLeft(): this is Left<L, R> {
    return false;
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;

export const left = <L, R>(value: L): Either<L, R> => {
  return new Left(value);
};

export const right = <L, R>(value: R): Either<L, R> => {
  return new Right(value);
};
