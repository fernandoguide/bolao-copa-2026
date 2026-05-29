import { useI18n } from '../i18n';
import { Locale } from '../i18n/types';

const localeLabels: Record<Locale, string> = {
    'pt-br': '🇧🇷 PT',
    'es': '🇪🇸 ES',
    'en': '🇺🇸 EN',
};

const locales: Locale[] = ['pt-br', 'es', 'en'];

export default function LanguageSwitcher() {
    const { locale, setLocale } = useI18n();

    return (
        <div className="flex items-center gap-1">
            {locales.map((loc) => (
                <button
                    key={loc}
                    onClick={() => setLocale(loc)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${locale === loc
                            ? 'bg-primary-600/30 text-primary-300 border border-primary-500/40'
                            : 'text-dark-400 hover:text-white hover:bg-dark-700/50 border border-transparent'
                        }`}
                >
                    {localeLabels[loc]}
                </button>
            ))}
        </div>
    );
}
