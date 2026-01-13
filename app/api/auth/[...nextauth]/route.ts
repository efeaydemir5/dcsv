import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

// NextAuth v4 App Router route handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
