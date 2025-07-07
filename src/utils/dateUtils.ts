import { useI18nContext } from '@/context/I18nProvider';

// Locale mapping for date formatting
const LOCALE_MAP = {
	en: 'en-US',
	ro: 'ro-RO',
} as const;

// Date format options for different locales
const DATE_FORMATS = {
	'en-US': {
		short: {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		},
		long: {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		},
		withTime: {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		},
	},
	'ro-RO': {
		short: {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		},
		long: {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		},
		withTime: {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		},
	},
} as const;

/**
 * Format a date string using the current locale
 */
export function formatDate(dateString: string, locale?: string): string {
	const currentLocale = locale || 'en-US';
	const options = DATE_FORMATS[currentLocale as keyof typeof DATE_FORMATS]?.short || DATE_FORMATS['en-US'].short;

	return new Date(dateString).toLocaleDateString(currentLocale, options);
}

/**
 * Format a date string with time using the current locale
 */
export function formatDateTime(dateString: string, locale?: string): string {
	const currentLocale = locale || 'en-US';
	const options = DATE_FORMATS[currentLocale as keyof typeof DATE_FORMATS]?.withTime || DATE_FORMATS['en-US'].withTime;

	return new Date(dateString).toLocaleString(currentLocale, options);
}

/**
 * Format a date string with long month name using the current locale
 */
export function formatDateLong(dateString: string, locale?: string): string {
	const currentLocale = locale || 'en-US';
	const options = DATE_FORMATS[currentLocale as keyof typeof DATE_FORMATS]?.long || DATE_FORMATS['en-US'].long;

	return new Date(dateString).toLocaleDateString(currentLocale, options);
}

/**
 * Hook to get localized date formatting functions
 */
export function useLocalizedDate() {
	const { lang } = useI18nContext();
	const currentLocale = LOCALE_MAP[lang as keyof typeof LOCALE_MAP] || 'en-US';

	return {
		formatDate: (dateString: string) => formatDate(dateString, currentLocale),
		formatDateTime: (dateString: string) => formatDateTime(dateString, currentLocale),
		formatDateLong: (dateString: string) => formatDateLong(dateString, currentLocale),
		locale: currentLocale,
	};
}
