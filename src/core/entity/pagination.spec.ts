import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("should set skip and take", () => {
    const pagination = Pagination.create({ page: 3, limit: 10 });

    expect(pagination.skip).toBe(20);
    expect(pagination.take).toBe(10);
    expect(pagination.page).toBe(3);
    expect(pagination.limit).toBe(10);
  });

  it("should calculate total pages", () => {
    const pagination = Pagination.create({ page: 1, limit: 10 });
    const totalItems = 15;

    const sut = pagination.calculate(totalItems);

    expect(sut).toEqual({
      totalPages: 2,
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("should calculate total pages with no items", () => {
    const pagination = Pagination.create({ page: 1, limit: 10 });
    const totalItems = 0;

    const sut = pagination.calculate(totalItems);

    expect(sut).toEqual({
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
