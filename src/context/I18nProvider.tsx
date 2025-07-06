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
	t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [lang, setLangState] = useState<Lang>('en');

	useEffect(() => {
		// On mount, check localStorage or system language
		const stored = localStorage.getItem(LANG_KEY) as Lang | null;
		if (stored && SUPPORTED_LANGS.includes(stored)) {
			setLangState(stored);
		} else {
			const sys = navigator.language.toLowerCase();
			if (sys.startsWith('ro')) {
				setLangState('ro');
			} else {
				setLangState('en');
			}
		}
	}, []);

	const setLang = useCallback((l: Lang) => {
		setLangState(l);
		localStorage.setItem(LANG_KEY, l);
	}, []);

	const t = useCallback(
		(key: string) => {
			return translations[lang][key] || key;
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
