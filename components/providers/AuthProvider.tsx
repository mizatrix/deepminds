'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Users are initialized lazily on the server side when needed
    // We don't need to block the client main thread with bcrypt hashing
    return <SessionProvider>{children}</SessionProvider>;
}
