"use client";

import { useSession, signOut } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";

type Role = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

interface RoleContextType {
    role: Role;
    setRole: (role: Role) => void;
    toggleRole: () => void;
    isAdmin: boolean; // True for both ADMIN and SUPER_ADMIN
    isSuperAdmin: boolean; // True only for SUPER_ADMIN
    setIsAdmin: (isAdmin: boolean) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    logout: () => void;
    userRole: Role | null; // The actual role from the database
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isAdmin, setIsAdminState] = useState(false);
    const [isSuperAdmin, setIsSuperAdminState] = useState(false);
    const [isAuthenticated, setIsAuthenticatedState] = useState(false);
    const [role, setRoleState] = useState<Role>("STUDENT");
    const [userRole, setUserRole] = useState<Role | null>(null);

    const [sessionInitialized, setSessionInitialized] = useState(false);

    const { data: session, status } = useSession();

    useEffect(() => {
        setMounted(true);
        // Don't load from localStorage on mount - let session data be the source of truth
    }, []);

    // Sync with NextAuth session
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const sessionRole = (session.user as any).role as Role;
            setUserRole(sessionRole);

            // Set authentication state
            if (!isAuthenticated) {
                setIsAuthenticatedState(true);
                localStorage.setItem("is-authenticated", "true");
            }

            // Sync user info for other components
            if (session.user.email && localStorage.getItem('userEmail') !== session.user.email) {
                localStorage.setItem('userEmail', session.user.email);
            }
            if (session.user.name && localStorage.getItem('userName') !== session.user.name) {
                localStorage.setItem('userName', session.user.name);
            }

            // Set admin status based on session role (ADMIN or SUPER_ADMIN)
            const isUserAdmin = sessionRole === 'ADMIN' || sessionRole === 'SUPER_ADMIN';
            const isUserSuperAdmin = sessionRole === 'SUPER_ADMIN';

            if (isAdmin !== isUserAdmin) {
                setIsAdminState(isUserAdmin);
                localStorage.setItem("is-admin", String(isUserAdmin));
            }

            if (isSuperAdmin !== isUserSuperAdmin) {
                setIsSuperAdminState(isUserSuperAdmin);
                localStorage.setItem("is-super-admin", String(isUserSuperAdmin));
            }

            // INITIALIZATION LOGIC
            // Ensure we set the correct default role based on the user's actual role from DB
            // We only do this ONCE when the session first loads or when user changes
            if (!sessionInitialized) {
                if (isUserAdmin) {
                    // Admins and Super Admins always start in ADMIN view
                    setRoleState('ADMIN');
                    localStorage.setItem("user-role", "ADMIN");
                } else {
                    // Students always start in STUDENT view
                    setRoleState('STUDENT');
                    localStorage.setItem("user-role", "STUDENT");
                }
                setSessionInitialized(true);
            } else {
                // SUBSEQUENT UPDATES (after initialization)
                // If user is no longer admin (e.g. session changed), force student role
                if (!isUserAdmin && role !== 'STUDENT') {
                    setRoleState('STUDENT');
                    localStorage.setItem("user-role", "STUDENT");
                }
                // If user IS admin, we do NOTHING here.
                // This allows the local 'role' state to vary (via toggleRole) without being overwritten.
            }
        } else if (status === 'unauthenticated') {
            if (isAuthenticated) setIsAuthenticatedState(false);
            if (isAdmin) setIsAdminState(false);
            if (isSuperAdmin) setIsSuperAdminState(false);
            if (role !== 'STUDENT') setRoleState('STUDENT');
            setUserRole(null);
            setSessionInitialized(false);
        }
    }, [status, session, sessionInitialized]);

    const setIsAdmin = (value: boolean) => {
        setIsAdminState(value);
        localStorage.setItem("is-admin", String(value));
        if (!value) {
            setRole("STUDENT"); // Force reset if no longer admin
            setIsSuperAdminState(false);
            localStorage.setItem("is-super-admin", "false");
        }
    };

    const setIsAuthenticated = (value: boolean) => {
        setIsAuthenticatedState(value);
        localStorage.setItem("is-authenticated", String(value));
    };

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
        localStorage.setItem("user-role", newRole);
    };

    const toggleRole = () => {
        if (!isAdmin) return; // Prevent non-admins from switching
        const newRole = role === "STUDENT" ? "ADMIN" : "STUDENT";
        setRole(newRole);
    };

    const logout = async () => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsSuperAdminState(false);
        setRole("STUDENT");
        setUserRole(null);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('is-super-admin');
        await signOut({ callbackUrl: '/login' });
    };

    // Don't render children until mounted to prevent flicker
    if (!mounted) {
        return null;
    }

    return (
        <RoleContext.Provider value={{
            role,
            setRole,
            toggleRole,
            isAdmin,
            isSuperAdmin,
            setIsAdmin,
            isAuthenticated,
            setIsAuthenticated,
            logout,
            userRole
        }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error("useRole must be used within a RoleProvider");
    }
    return context;
}
