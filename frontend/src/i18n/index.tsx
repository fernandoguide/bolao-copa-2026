import { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, Translations } from './types';
import { ptBR } from './pt-br';
import { es } from './es';
import { en } from './en';

const translations: Record<Locale, Translations> = {
    'pt-br': ptBR,
    'es': es,
    'en': en,
};

interface I18nContextData {
    locale: Locale;
    t: Translations;
    setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextData>({} as I18nContextData);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(() => {
        const saved = localStorage.getItem('locale') as Locale | null;
        return saved && translations[saved] ? saved : 'pt-br';
    });

    function handleSetLocale(newLocale: Locale) {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
    }

    const t = translations[locale];

    return (
        <I18nContext.Provider value={{ locale, t, setLocale: handleSetLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
