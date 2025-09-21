'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { signOut } from '@/lib/auth/actions'
import { useRouter } from 'next/navigation'

interface User {
	id: string
	name: string
	email: string
	image?: string | null
}

interface UserContextType {
	user: User | null
	isLoading: boolean
	logout: () => Promise<void>
	refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	const refreshUser = async () => {
		try {
			const res = await fetch('/api/auth/session', {
				method: 'GET',
				credentials: 'include',
				cache: 'no-store',
			})
			if (!res.ok) {
				setUser(null)
				return
			}
			const data = await res.json()
			setUser(data?.user ?? null)
		} catch {
			setUser(null)
		} finally {
			setIsLoading(false)
		}
	}

	const logout = async () => {
		try {
			// Call Better Auth REST endpoint(s) directly so Set-Cookie clears in the browser
			await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {})
			await fetch('/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {})
			// Fallback to server action in case the endpoint is unreachable
			await signOut()
			setUser(null)
			router.replace('/')
			router.refresh()
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}

	useEffect(() => {
		refreshUser()
	}, [])

	return (
		<UserContext.Provider value={{ user, isLoading, logout, refreshUser }}>
			{children}
		</UserContext.Provider>
	)
}

export function useUser() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider')
	}
	return context
}
