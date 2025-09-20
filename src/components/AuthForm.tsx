"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SocialProviders from "./SocialProviders";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";

type Props = {
    mode: "sign-in" | "sign-up";
    onSubmitAction: (formData: FormData) => Promise<{ ok: boolean; userId?: string; error?: string } | void>;
};

export default function AuthForm({ mode, onSubmitAction }: Props) {
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await onSubmitAction(formData);

            if (result?.ok) {
                setSuccess(mode === "sign-in" ? "Successfully signed in!" : "Account created successfully!");
                setTimeout(() => {
                    router.push(redirectTo);
                }, 1500);
            } else if (result?.error) {
                setError(result.error);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } catch (e) {
            console.error("Auth error:", e);
            setError("Failed to process your request. Please check your details and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-body text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-body text-green-800">{success}</p>
                    </div>
                </div>
            )}

            <div className="text-center">
                <h1 className="text-heading-2 gradient-text">
                    {mode === "sign-in" ? "Welcome Back!" : "Join Nike Today!"}
                </h1>
                <p className="mt-2 text-body text-dark-700">
                    {mode === "sign-in"
                        ? "Sign in to continue your journey"
                        : "Create your account to start your fitness journey"}
                </p>
                <p className="mt-4 text-caption text-dark-600">
                    {mode === "sign-in" ? "Don't have an account? " : "Already have an account? "}
                    <Link 
                        href={mode === "sign-in" ? "/sign-up" : "/sign-in"} 
                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        {mode === "sign-in" ? "Sign Up" : "Sign In"}
                    </Link>
                </p>
            </div>

            <SocialProviders variant={mode} />

            <div className="flex items-center gap-4">
                <hr className="h-px w-full border-0 bg-light-300" />
                <span className="shrink-0 text-caption text-dark-700">
          Or {mode === "sign-in" ? "sign in" : "sign up"} with
        </span>
                <hr className="h-px w-full border-0 bg-light-300" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {mode === "sign-up" && (
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-body-medium text-dark-900 font-medium">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus-ring transition-all duration-200 hover:border-blue-400"
                            autoComplete="name"
                            required
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="email" className="text-body-medium text-dark-900 font-medium">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="johndoe@gmail.com"
                        className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 focus-ring transition-all duration-200 hover:border-blue-400"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-body-medium text-dark-900 font-medium">Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={show ? "text" : "password"}
                            placeholder="minimum 8 characters"
                            className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 pr-12 text-body text-dark-900 placeholder:text-dark-500 focus-ring transition-all duration-200 hover:border-blue-400"
                            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                            minLength={8}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 px-3 text-dark-500 hover:text-dark-700 transition-colors"
                            onClick={() => setShow((v) => !v)}
                            aria-label={show ? "Hide password" : "Show password"}
                        >
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-hover w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-body-medium font-semibold text-white shadow-lg hover:shadow-glow focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {mode === "sign-in" ? "Signing In..." : "Creating Account..."}
                        </div>
                    ) : (
                        mode === "sign-in" ? "Sign In" : "Sign Up"
                    )}
                </button>

                {mode === "sign-up" && (
                    <p className="text-center text-footnote text-dark-700">
                        By signing up, you agree to our{" "}
                        <a href="#" className="underline">Terms of Service</a> and{" "}
                        <a href="#" className="underline">Privacy Policy</a>
                    </p>
                )}
            </form>
        </div>
    );
}
