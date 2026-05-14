import { Elysia } from "elysia";

export const securityHeadersPlugin = new Elysia({ name: "security-headers" }).onAfterHandle(
  { as: "global" },
  ({ set }) => {
    set.headers["x-content-type-options"] = "nosniff";
    set.headers["x-frame-options"] = "DENY";
    set.headers["x-xss-protection"] = "0";
    set.headers["x-dns-prefetch-control"] = "off";
    set.headers["referrer-policy"] = "strict-origin-when-cross-origin";
    set.headers["permissions-policy"] = "camera=(), microphone=(), geolocation=()";
    set.headers["strict-transport-security"] = "max-age=15552000; includeSubDomains";
    set.headers["cross-origin-opener-policy"] = "same-origin";
    set.headers["cross-origin-resource-policy"] = "same-origin";
    set.headers["origin-agent-cluster"] = "?1";
  },
);
