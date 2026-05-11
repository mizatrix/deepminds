import NextAuth, { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';
import { createUser, findUserByEmail, findDeletedUserByEmail } from './users-db';

export const authConfig: NextAuthConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'select_account',
                    hd: 'msa.edu.eg',
                },
            },
        }),
    ],

    pages: {
        signIn: '/sign-in',
        signOut: '/sign-in',
        error: '/sign-in',
    },

    callbacks: {
        async signIn({ user, account }) {
            const email = (user.email || '').toLowerCase();

            if (!email.endsWith('@msa.edu.eg')) {
                try {
                    const cookieStore = await cookies();
                    cookieStore.set('auth_rejected_email', email, {
                        maxAge: 60,
                        httpOnly: false,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                    });
                } catch {}
                return false;
            }

            if (await findDeletedUserByEmail(email)) return false;

            let dbUser = await findUserByEmail(email);
            if (!dbUser) {
                try {
                    dbUser = await createUser({
                        email,
                        name: user.name || 'User',
                        image: user.image ?? undefined,
                        provider: account?.provider,
                        role: 'STUDENT',
                    });
                } catch (error) {
                    console.error('[signIn] Error creating user:', error);
                    return false;
                }
            } else if (!dbUser.isActive) {
                return false;
            }

            // Attach DB-authoritative id and role to the NextAuth user so the
            // jwt callback (which runs in Edge runtime and cannot hit Prisma)
            // can read them. Without this, every JWT defaults to role=STUDENT
            // and admins get redirected away from /admin/* by proxy.ts.
            (user as any).id = dbUser.id;
            (user as any).role = dbUser.role;

            return true;
        },

        async jwt({ token, user, account }) {
            // Initial sign in - store user data in JWT
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || 'STUDENT';
                token.provider = account?.provider;
            }

            // Note: We don't fetch from database here because:
            // 1. The JWT callback runs in Edge Runtime (middleware) where Prisma doesn't work
            // 2. The role is already stored in the JWT from initial sign-in
            // If you need to refresh the role, the user should re-login

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).provider = token.provider as string;
            }

            return session;
        },
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // Update session every 24 hours to keep it fresh
    },

    // Trust the host header from Vercel's proxy
    trustHost: true,

    debug: process.env.NODE_ENV === 'development',

    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
