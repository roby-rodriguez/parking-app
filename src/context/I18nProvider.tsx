import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
// Import translations (will be replaced with dynamic import if needed)
import en from '@/locales/en.json';
import ro from '@/locales/ro.json';

const LANG_KEY = 'lang';
const SUPPORTED_LANGS = ['en', 'ro'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

const translations: Record<Lang, Record<string, string>> = { en, ro };

interface I18nContextType {
	lang: Lang;
	setLang: (lang: Lang) => void;
	t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const getInitialLang = (): Lang => {
		// Check localStorage first
		const stored = localStorage.getItem(LANG_KEY) as Lang | null;
		if (stored && SUPPORTED_LANGS.includes(stored)) {
			return stored;
		}

		// Fall back to system language
		const sys = navigator.language.toLowerCase();
		if (sys.startsWith('ro')) {
			return 'ro';
		}
		return 'en';
	};

	const [lang, setLangState] = useState<Lang>(getInitialLang);

	const setLang = useCallback((l: Lang) => {
		setLangState(l);
		localStorage.setItem(LANG_KEY, l);
	}, []);

	const t = useCallback(
		(key: string, params?: Record<string, string>) => {
			let message = translations[lang][key] || key;

			// Handle dynamic content interpolation
			if (params) {
				Object.entries(params).forEach(([paramKey, value]) => {
					message = message.replace(`{${paramKey}}`, value);
				});
			}

			return message;
		},
		[lang],
	);

	return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18nContext = () => {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error('useI18nContext must be used within I18nProvider');
	}
	return ctx;
};
