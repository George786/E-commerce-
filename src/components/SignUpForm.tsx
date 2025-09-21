"use client";

import { Suspense } from "react";
import AuthForm from "./AuthForm";
import { signUp } from "@/lib/auth/actions";

export default function SignUpForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm mode="sign-up" onSubmitAction={signUp} />
        </Suspense>
    );
}
