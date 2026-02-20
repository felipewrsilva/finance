import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { Prisma } from "@prisma/client";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;

      const dbUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        },
        create: {
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        },
        select: { id: true },
      });

      const accountCount = await prisma.account.count({
        where: { userId: dbUser.id },
      });

      if (accountCount === 0) {
        await prisma.account.create({
          data: {
            userId: dbUser.id,
            name: "Main Account",
            type: "CHECKING",
            balance: new Prisma.Decimal(0),
            isDefault: true,
          },
        });
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, currency: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.currency = dbUser.currency;
        }
      }
      return session;
    },
  },
});
