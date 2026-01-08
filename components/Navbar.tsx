"use client";

import { useAuth } from "./AuthProvider";

export function Navbar() {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Classroom 2.0
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {user.photoURL && (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || "User"}
                                            className="h-8 w-8 rounded-full border border-gray-200"
                                        />
                                    )}
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user.displayName}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
