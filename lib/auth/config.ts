import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { verifyPassword, createUser, findUserByEmail } from './users-db';
import { loginSchema } from './validation';

export const authConfig: NextAuthConfig = {
    providers: [
        // Email/Password Credentials Provider
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    // Validate input
                    const { email, password } = loginSchema.parse(credentials);

                    // Verify user credentials
                    const user = await verifyPassword(email, password);

                    if (!user) {
                        return null;
                    }

                    // Return user object (password excluded)
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('Authorization error:', error);
                    return null;
                }
            },
        }),

        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),

        // GitHub OAuth Provider
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],

    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers, create user if doesn't exist
            if (account?.provider !== 'credentials') {
                const existingUser = await findUserByEmail(user.email!);

                if (!existingUser) {
                    try {
                        await createUser({
                            email: user.email!,
                            name: user.name || 'User',
                            image: user.image ?? undefined,
                            provider: account?.provider,
                            role: 'STUDENT', // Default role for OAuth users
                        });
                    } catch (error) {
                        console.error('Error creating OAuth user:', error);
                        return false;
                    }
                }
            }

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

    debug: process.env.NODE_ENV === 'development',

    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
