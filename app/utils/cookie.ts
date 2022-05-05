import { createCookie } from "@remix-run/cloudflare";

export const userPrefs = createCookie("user-prefs", {
  maxAge: 60 * 60 * 24,
  sameSite: "strict",
});
