import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = nextUrl.pathname.startsWith("/login");
      if (isPublic) return true;
      if (isLoggedIn) return true;
      return false;
    },
  },
  providers: [],
};
