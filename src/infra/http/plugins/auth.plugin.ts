import { Elysia } from "elysia";

import { container } from "@/infra/container";
import { TOKENS } from "@/infra/container/tokens";
import { HttpErrors } from "@/infra/http/http-errors";
import { CryptographGateway } from "@/modules/auth/application/gateways/cryptograph.gateway";

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

    if (!token) return { auth: null };

    const cryptographGateway = container.get<CryptographGateway>(TOKENS.CryptographGateway);
    const claims = await cryptographGateway.verify(token);

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
