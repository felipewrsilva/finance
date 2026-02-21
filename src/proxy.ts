import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except API routes, Next.js internals, and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|banks/).*)"],
};
