import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/shared/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_client_secret",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT since we are interacting with middleware potentially
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        
        // Fetch credits from db
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        
        if (dbUser) {
          (session.user as any).credits = dbUser.credits;
        } else {
          (session.user as any).credits = 0;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
