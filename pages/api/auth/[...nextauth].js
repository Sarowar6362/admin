//pages/api/auth/...[nextauth].js
import NextAuth, {getServerSession} from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

const adminEmails = ['abdullahandbrothers76@gmail.com', 'sarowar6362@gmail.com'];
export const maxDuration = 300;
export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({session,token,user}) => {
      if (adminEmails.includes(session?.user?.email)) {
        session.isAdmin = adminEmails.includes(session?.user?.email);
        return session;
      } else {
        return false;
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !adminEmails.includes(session.user.email)) {
    res.status(401).json({ error: 'Not authorized' });
    return false; // Ensures the function stops
  }
  return true;
}
