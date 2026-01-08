"use client";

import { useAuth } from "./AuthProvider";

export function Hero() {
    const { user, signInWithGoogle } = useAuth();

    return (
        <div className="relative overflow-hidden bg-white pt-32 pb-16 sm:pt-40 sm:pb-24">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                    The Future of <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Digital Learning
                    </span>
                </h1>
                <p className="max-w-2xl text-lg sm:text-xl text-gray-500 mb-10">
                    Experience a seamless, intelligent, and collaborative classroom environment designed for the modern age.
                </p>

                {!user && (
                    <button
                        onClick={signInWithGoogle}
                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Get Started for Free
                    </button>
                )}

                {user && (
                    <a
                        href="/dashboard"
                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go to Dashboard →
                    </a>
                )}

                <div className="mt-16 w-full max-w-5xl">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
                        <p className="text-gray-400 font-medium">App Screenshot / Demo Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
