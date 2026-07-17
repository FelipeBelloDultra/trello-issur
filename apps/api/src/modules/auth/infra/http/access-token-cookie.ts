import { CookieOptions } from "express";

import { env } from "@/config/env";
import { parseDurationToSeconds } from "@/core/utils/duration";

export const ACCESS_TOKEN_COOKIE = "access_token";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
  maxAge: parseDurationToSeconds(env.JWT_ACCESS_EXPIRES) * 1000,
};
