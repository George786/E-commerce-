'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth/actions'
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
			const currentUser = await getCurrentUser()
			setUser(currentUser)
		} catch {
			setUser(null)
		} finally {
			setIsLoading(false)
		}
	}

	const logout = async () => {
		try {
			await signOut()
			setUser(null)
			router.push('/')
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
