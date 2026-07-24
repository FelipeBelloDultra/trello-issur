import { Request, Response } from "express";

import { InMemoryCacheRepository } from "@/test/cache/in-memory-cache-repository";

import { IdempotencyMiddleware } from "./idempotency.middleware";

function makeReq(idempotencyKey?: string): Request {
  return {
    path: "/auth/refresh",
    headers: idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {},
  } as unknown as Request;
}

// `res.send` gets reassigned by the middleware itself on a cache miss, so
// asserting against it afterward would check the wrapper, not what was
// actually sent — track the final sent status/body/headers in plain state
// instead, mirroring what a real client observes.
function makeRes() {
  const headers: Record<string, string | string[]> = {};
  const sent: { statusCode?: number; body?: unknown } = {};
  const setHeader = vi.fn((name: string, value: string | string[]) => {
    headers[name] = value;
  });

  const raw = {
    statusCode: 200,
    setHeader,
    getHeaders: vi.fn(() => headers),
    status: vi.fn((code: number) => {
      raw.statusCode = code;
      return raw;
    }),
    send: vi.fn((body?: unknown) => {
      sent.statusCode = raw.statusCode;
      sent.body = body;
      return raw;
    }),
  };

  return { res: raw as unknown as Response, headers, sent, setHeader };
}

describe("IdempotencyMiddleware", () => {
  let cache: InMemoryCacheRepository;
  let sut: IdempotencyMiddleware;

  beforeEach(() => {
    cache = new InMemoryCacheRepository();
    sut = new IdempotencyMiddleware(cache);
  });

  it("calls next without touching the cache when no idempotency key is sent", async () => {
    const { res } = makeRes();
    const next = vi.fn();

    await sut.handle({ ttlSeconds: 30 })(makeReq(), res, next);

    expect(next).toHaveBeenCalled();
    expect(cache.items.size).toBe(0);
  });

  it("lets the request through and caches the response on first use of a key", async () => {
    const req = makeReq("key-1");
    const { res, sent } = makeRes();
    const next = vi.fn(() => {
      res.setHeader("set-cookie", "refresh_token=new-token");
      res.status(200).send({ data: { authenticated: true } });
    });

    await sut.handle({ ttlSeconds: 30 })(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(sent).toEqual({ statusCode: 200, body: { data: { authenticated: true } } });
    expect(cache.items.size).toBe(1);
  });

  it("replays the cached response instead of calling next when the key repeats", async () => {
    const { res: res1 } = makeRes();
    const next1 = vi.fn(() => {
      res1.setHeader("set-cookie", "refresh_token=new-token");
      res1.status(200).send({ data: { authenticated: true } });
    });
    await sut.handle({ ttlSeconds: 30 })(makeReq("key-1"), res1, next1);

    const { res: res2, sent: sent2, setHeader: setHeader2 } = makeRes();
    const next2 = vi.fn();
    await sut.handle({ ttlSeconds: 30 })(makeReq("key-1"), res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(setHeader2).toHaveBeenCalledWith("set-cookie", "refresh_token=new-token");
    expect(sent2).toEqual({ statusCode: 200, body: { data: { authenticated: true } } });
  });

  it("does not replay a response cached under a different key", async () => {
    const { res: res1 } = makeRes();
    await sut.handle({ ttlSeconds: 30 })(
      makeReq("key-1"),
      res1,
      vi.fn(() => res1.status(200).send({ data: { authenticated: true } })),
    );

    const { res: res2 } = makeRes();
    const next2 = vi.fn(() => res2.status(200).send({ data: { authenticated: true } }));
    await sut.handle({ ttlSeconds: 30 })(makeReq("key-2"), res2, next2);

    expect(next2).toHaveBeenCalled();
  });
});
