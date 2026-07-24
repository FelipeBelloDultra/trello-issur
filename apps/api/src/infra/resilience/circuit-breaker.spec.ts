import { createCircuitBreaker, wrapWithCircuitBreaker } from "./circuit-breaker";

describe("wrapWithCircuitBreaker", () => {
  it("routes allowlisted methods through the breaker", async () => {
    const target = {
      get: vi.fn((key: string) => Promise.resolve(`value:${key}`)),
    };
    const breaker = createCircuitBreaker("test-allowlisted");
    const fireSpy = vi.spyOn(breaker, "fire");

    const wrapped = wrapWithCircuitBreaker(target, breaker, ["get"]);
    const result = await wrapped.get("abc");

    expect(result).toBe("value:abc");
    expect(fireSpy).toHaveBeenCalledTimes(1);
    expect(target.get).toHaveBeenCalledWith("abc");
  });

  it("passes non-allowlisted methods through untouched", async () => {
    const target = { other: vi.fn(() => Promise.resolve("untouched")) };
    const breaker = createCircuitBreaker("test-passthrough");
    const fireSpy = vi.spyOn(breaker, "fire");

    const wrapped = wrapWithCircuitBreaker(target, breaker, []);
    const result = await wrapped.other();

    expect(result).toBe("untouched");
    expect(fireSpy).not.toHaveBeenCalled();
  });

  it("passes non-function properties through untouched", () => {
    const target = { status: "ready" };
    const breaker = createCircuitBreaker("test-property");

    const wrapped = wrapWithCircuitBreaker(target, breaker, []);

    expect(wrapped.status).toBe("ready");
  });
});

describe("createCircuitBreaker", () => {
  it("opens after the configured failure threshold", async () => {
    const breaker = createCircuitBreaker("test-open", {
      volumeThreshold: 1,
      errorThresholdPercentage: 1,
      resetTimeout: 100_000,
    });
    const failing = vi.fn(() => Promise.reject(new Error("boom")));
    // opossum flips `opened` from its own internal listener on the fired
    // promise, not synchronously when fire() rejects — waiting on the
    // 'open' event itself avoids a race against that internal bookkeeping.
    const opened = new Promise<void>((resolve) => breaker.once("open", resolve));

    await expect(breaker.fire(failing)).rejects.toThrow("boom");
    await opened;

    expect(breaker.opened).toBe(true);
  });

  it("fails fast without invoking the action once open", async () => {
    const breaker = createCircuitBreaker("test-fail-fast", {
      volumeThreshold: 1,
      errorThresholdPercentage: 1,
      resetTimeout: 100_000,
    });
    const failing = vi.fn(() => Promise.reject(new Error("boom")));
    const opened = new Promise<void>((resolve) => breaker.once("open", resolve));

    await expect(breaker.fire(failing)).rejects.toThrow("boom");
    await opened;
    failing.mockClear();

    await expect(breaker.fire(failing)).rejects.toThrow();
    expect(failing).not.toHaveBeenCalled();
  });

  it("stays closed and resolves normally when calls succeed", async () => {
    const breaker = createCircuitBreaker("test-closed");
    const succeeding = vi.fn((...args: unknown[]) => Promise.resolve((args[0] as number) * 2));

    const result = await breaker.fire(succeeding, 21);

    expect(result).toBe(42);
    expect(breaker.opened).toBe(false);
  });
});
