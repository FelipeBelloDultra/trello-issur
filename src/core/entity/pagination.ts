import { ValueObject } from "./value-object";

interface PaginationProps {
  page: number;
  limit: number;
}

export interface PaginationResult {
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class Pagination extends ValueObject<PaginationProps> {
  public get page(): number {
    return this.props.page;
  }

  public get limit(): number {
    return this.props.limit;
  }

  public get skip(): number {
    return (this.props.page - 1) * this.props.limit;
  }

  public get take(): number {
    return this.props.limit;
  }

  public calculate(totalItems: number): PaginationResult {
    return {
      totalPages: Math.ceil(totalItems / this.props.limit),
      currentPage: this.props.page,
      hasNextPage: this.props.page * this.props.limit < totalItems,
      hasPreviousPage: this.props.page > 1,
    };
  }

  public static create(props: PaginationProps): Pagination {
    if (props.page < 1) throw new Error("page must be >= 1");
    if (props.limit < 1) throw new Error("limit must be >= 1");
    return new Pagination(props);
  }
}
