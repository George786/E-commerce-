import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { signIn } from "@/lib/auth/actions";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm mode="sign-in" onSubmitAction={signIn} />
        </Suspense>
    );
}
