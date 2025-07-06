import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';

const LANGS = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ro', label: 'Română', flag: '🇷🇴' },
];

const LanguageSwitcher: React.FC = () => {
	const { lang, setLang } = useI18nContext();
	return (
		<select
			value={lang}
			onChange={(e) => setLang(e.target.value as 'en' | 'ro')}
			className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px]"
			style={{ minWidth: 44 }}
			aria-label="Language"
		>
			{LANGS.map((l) => (
				<option key={l.code} value={l.code}>
					{l.flag} {l.label}
				</option>
			))}
		</select>
	);
};

export default LanguageSwitcher;
