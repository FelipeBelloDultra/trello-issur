import { CookieOptions } from "express";

import { env } from "@/config/env";
import { parseDurationToSeconds } from "@/core/utils/duration";

export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: parseDurationToSeconds(env.JWT_REFRESH_EXPIRES) * 1000,
};
