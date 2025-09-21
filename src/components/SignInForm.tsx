"use client";

import { Suspense } from "react";
import AuthForm from "./AuthForm";
import { signIn } from "@/lib/auth/actions";

export default function SignInForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm mode="sign-in" onSubmitAction={signIn} />
        </Suspense>
    );
}
