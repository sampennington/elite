'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  type Locale,
  locales,
  localeNames,
  localeFlags,
  getLocaleFromPathname,
  addLocaleToPathname,
} from '@/i18n/config'

export const LanguageSwitcher: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const currentLocale = getLocaleFromPathname(pathname)

  const handleLocaleChange = (newLocale: Locale) => {
    const newPathname = addLocaleToPathname(pathname, newLocale)

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000` // 1 year

    router.push(newPathname)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md cursor-pointer transition-all text-sm text-foreground hover:bg-accent hover:border-border/80"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-xl leading-none">{localeFlags[currentLocale]}</span>
        <span className="font-medium">{localeNames[currentLocale]}</span>
        <svg
          className={`transition-transform duration-200 ml-1 ${isOpen ? 'rotate-180' : ''}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+0.5rem)] right-0 min-w-[12rem] bg-card border border-border rounded-lg shadow-lg z-[1000] overflow-hidden">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`flex items-center gap-3 w-full px-4 py-3 bg-transparent border-none cursor-pointer transition-colors text-sm text-foreground text-left hover:bg-accent ${
                  locale === currentLocale ? 'bg-muted font-semibold' : ''
                }`}
              >
                <span className="text-xl leading-none">{localeFlags[locale]}</span>
                <span className="font-medium">{localeNames[locale]}</span>
                {locale === currentLocale && (
                  <svg
                    className="ml-auto text-success"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 4L6 11.5L2.5 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
