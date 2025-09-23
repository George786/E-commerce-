import SignUpForm from "@/components/SignUpForm";

export const dynamic = 'force-dynamic'

export default function Page() {
    return (
        <div className="container mx-auto max-w-md py-12">
            <SignUpForm />
        </div>
    )
}
