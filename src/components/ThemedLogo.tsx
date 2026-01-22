'use client'

import { useEffect, useState } from 'react'

interface ThemedLogoProps {
  lightLogo?: string
  darkLogo?: string
  fallbackLogo?: string
  alt: string
  maxWidth: string
  className?: string
}

/**
 * Logo component that switches between light and dark versions based on theme
 *
 * Logo precedence:
 * 1. Theme-specific logo (lightLogo/darkLogo)
 * 2. Fallback logo (fallbackLogo)
 * 3. No logo shown
 */
export default function ThemedLogo({
  lightLogo,
  darkLogo,
  fallbackLogo,
  alt,
  maxWidth,
  className = ''
}: ThemedLogoProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check initial theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Determine which logo to show
  const logoUrl = theme === 'dark'
    ? (darkLogo || fallbackLogo)
    : (lightLogo || fallbackLogo)

  // Don't render if no logo available
  if (!logoUrl) {
    return null
  }

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      style={{
        maxWidth,
        height: 'auto',
        marginBottom: '1.5rem',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}
    />
  )
}
