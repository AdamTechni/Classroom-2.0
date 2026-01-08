"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) {
            toast.error('Firebase is not configured. Please check environment variables.');
            return;
        }

        try {
            const loadingToast = toast.loading('Signing in...');
            await signInWithPopup(auth, googleProvider);
            toast.success('Successfully signed in!', { id: loadingToast });
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            toast.error(`Sign in failed: ${error.message || 'Unknown error'}`);
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast.success('Signed out successfully');
        } catch (error) {
            console.error("Error signing out", error);
            toast.error('Failed to sign out');
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
