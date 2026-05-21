import { Elysia } from "elysia";

export const securityHeadersPlugin = new Elysia({ name: "security-headers" }).headers({
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-xss-protection": "0",
  "x-dns-prefetch-control": "off",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=15552000; includeSubDomains",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "origin-agent-cluster": "?1",
});
