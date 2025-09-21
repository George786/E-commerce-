'use client'

import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
	className?: string
}

export default function BackButton({ className = '' }: BackButtonProps) {
	const handleBack = () => {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back()
		} else {
			window.location.href = '/'
		}
	}

	return (
		<button
			onClick={handleBack}
			className={`btn-hover flex items-center gap-2 rounded-lg border border-light-300 bg-light-100 px-3 py-2 text-body text-dark-900 hover:bg-light-200 focus-ring ${className}`}
		>
			<ArrowLeft className="h-4 w-4" />
			Back
		</button>
	)
}


