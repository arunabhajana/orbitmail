"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";

export interface User {
    email: string;
    name: string;
    picture: string;
    provider: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: (accountId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Global authentication provider.
 * Manages user state, session persistence, and primary auth flows.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        restoreSession();
    }, []);

    /**
     * Attempts to restore the active user session from the backend.
     * Falls back to localStorage for seamless UI transitions.
     */
    const restoreSession = async () => {
        try {
            const currentUser = await invoke<User | null>("get_current_user");

            if (currentUser) {
                setUser(currentUser);
            } else {
                const storedUser = localStorage.getItem("orion_user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } catch (error) {
            console.error("Auth: Session restoration failed", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initiates the Google OAuth login flow via Tauri.
     */
    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            const profile = await invoke<User>("login_google");
            setUser(profile);
            localStorage.setItem("orion_user", JSON.stringify(profile));
            router.push("/inbox");
        } catch (error) {
            console.error("Auth: Google login failed", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Terminates the current account session.
     */
    const logout = async (accountId: string) => {
        try {
            await invoke("logout_user", { accountId });
            setUser(null);
            localStorage.removeItem("orion_user");
            router.push("/");
        } catch (error) {
            console.error("Auth: Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                loginWithGoogle,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
