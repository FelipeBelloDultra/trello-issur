import { ValueObject } from "@/core/entity/value-object";

interface TokenPairProps {
  accessToken: string;
  refreshToken: string;
}

export class TokenPair extends ValueObject<TokenPairProps> {
  public get accessToken(): string {
    return this.props.accessToken;
  }

  public get refreshToken(): string {
    return this.props.refreshToken;
  }

  private constructor(props: TokenPairProps) {
    super(props);
  }

  public static create(accessToken: string, refreshToken: string): TokenPair {
    return new TokenPair({ accessToken, refreshToken });
  }
}
