import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { I18nProvider, useI18n } from '../i18n';

function TestComponent() {
    const { t, locale, setLocale } = useI18n();
    return (
        <div>
            <span data-testid="locale">{locale}</span>
            <span data-testid="loading">{t.loading}</span>
            <span data-testid="app-title">{t.appTitle}</span>
            <span data-testid="nav-rules">{t.navRules}</span>
            <button data-testid="switch-en" onClick={() => setLocale('en')}>EN</button>
            <button data-testid="switch-es" onClick={() => setLocale('es')}>ES</button>
            <button data-testid="switch-pt" onClick={() => setLocale('pt-br')}>PT</button>
        </div>
    );
}

function renderWithI18n() {
    return render(
        <I18nProvider>
            <TestComponent />
        </I18nProvider>
    );
}

describe('I18n System', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('defaults to pt-br locale', () => {
        renderWithI18n();
        expect(screen.getByTestId('locale')).toHaveTextContent('pt-br');
        expect(screen.getByTestId('loading')).toHaveTextContent('Carregando...');
    });

    it('provides Portuguese translations by default', () => {
        renderWithI18n();
        expect(screen.getByTestId('nav-rules')).toHaveTextContent('📋 Regras');
    });

    it('switches to English when setLocale("en") is called', async () => {
        const user = userEvent.setup();
        renderWithI18n();

        await user.click(screen.getByTestId('switch-en'));

        expect(screen.getByTestId('locale')).toHaveTextContent('en');
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
        expect(screen.getByTestId('nav-rules')).toHaveTextContent('📋 Rules');
    });

    it('switches to Spanish when setLocale("es") is called', async () => {
        const user = userEvent.setup();
        renderWithI18n();

        await user.click(screen.getByTestId('switch-es'));

        expect(screen.getByTestId('locale')).toHaveTextContent('es');
        expect(screen.getByTestId('loading')).toHaveTextContent('Cargando...');
        expect(screen.getByTestId('nav-rules')).toHaveTextContent('📋 Reglas');
    });

    it('switches back to Portuguese', async () => {
        const user = userEvent.setup();
        renderWithI18n();

        await user.click(screen.getByTestId('switch-en'));
        expect(screen.getByTestId('locale')).toHaveTextContent('en');

        await user.click(screen.getByTestId('switch-pt'));
        expect(screen.getByTestId('locale')).toHaveTextContent('pt-br');
        expect(screen.getByTestId('loading')).toHaveTextContent('Carregando...');
    });

    it('persists locale to localStorage', async () => {
        const user = userEvent.setup();
        renderWithI18n();

        await user.click(screen.getByTestId('switch-es'));
        expect(localStorage.getItem('locale')).toBe('es');

        await user.click(screen.getByTestId('switch-en'));
        expect(localStorage.getItem('locale')).toBe('en');
    });

    it('restores locale from localStorage', () => {
        localStorage.setItem('locale', 'en');
        renderWithI18n();
        expect(screen.getByTestId('locale')).toHaveTextContent('en');
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    });

    it('falls back to pt-br for invalid localStorage value', () => {
        localStorage.setItem('locale', 'invalid');
        renderWithI18n();
        expect(screen.getByTestId('locale')).toHaveTextContent('pt-br');
    });
});
