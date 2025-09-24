'use client'

import { useEffect, useState } from 'react'

function deriveCountryFromLocale(locale: string | undefined): string | null {
	if (!locale) return null
	// Examples: en-US, fr-FR, pt-BR, en, zh-Hans-CN
	const parts = locale.replace('@calendar=gregory', '').split(/[-_]/)
	const region = parts.find((p) => p.length === 2 && /[A-Z]{2}/.test(p))
	if (!region) return null
	try {
		// Intl.DisplayNames is supported in modern browsers
		const dn = new Intl.DisplayNames([locale], { type: 'region' })
		return dn.of(region) || region
	} catch {
		return region
	}
}

export default function FooterRegion() {
	const [region, setRegion] = useState<string>('Global')

	useEffect(() => {
		try {
			const navigatorLocale = (navigator.languages && navigator.languages[0]) || navigator.language
			const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale
			const fromNavigator = deriveCountryFromLocale(navigatorLocale)
			const fromIntl = deriveCountryFromLocale(intlLocale)
			setRegion(fromNavigator || fromIntl || 'Global')
		} catch {
			setRegion('Global')
		}
	}, [])

	return <span>{region}</span>
}

