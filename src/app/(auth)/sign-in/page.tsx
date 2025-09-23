import SignInForm from "@/components/SignInForm";

export const dynamic = 'force-dynamic'

export default function Page() {
    return (
        <div className="container mx-auto max-w-md py-12">
            <SignInForm />
        </div>
    )
}
