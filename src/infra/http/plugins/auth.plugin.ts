import { Elysia } from "elysia";

import { container } from "@/infra/container";
import { TOKENS } from "@/infra/container/tokens";
import { HttpErrors } from "@/infra/http/http-errors";
import { EncryptGateway } from "@/modules/auth/application/gateways/encrypt.gateway";

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

    if (!token) return { auth: null };

    const encryptGateway = container.get<EncryptGateway>(TOKENS.EncryptGateway);
    const claims = await encryptGateway.verifyAccessToken(token);

    if (!claims) return { auth: null };

    return { auth: { userId: claims.sub, email: claims.email } };
  },
);

export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authPlugin)
  .onBeforeHandle({ as: "scoped" }, ({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return HttpErrors.unauthorized("Authentication required");
    }
  });
