import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { I18nProvider } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

function renderSwitcher() {
    return render(
        <I18nProvider>
            <LanguageSwitcher />
        </I18nProvider>
    );
}

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders three language buttons', () => {
        renderSwitcher();
        expect(screen.getByText('🇧🇷 PT')).toBeInTheDocument();
        expect(screen.getByText('🇪🇸 ES')).toBeInTheDocument();
        expect(screen.getByText('🇺🇸 EN')).toBeInTheDocument();
    });

    it('highlights the active locale (pt-br by default)', () => {
        renderSwitcher();
        const ptButton = screen.getByText('🇧🇷 PT');
        expect(ptButton.className).toContain('bg-primary-600/30');
    });

    it('changes active locale on click', async () => {
        const user = userEvent.setup();
        renderSwitcher();

        const enButton = screen.getByText('🇺🇸 EN');
        await user.click(enButton);

        expect(enButton.className).toContain('bg-primary-600/30');
        const ptButton = screen.getByText('🇧🇷 PT');
        expect(ptButton.className).not.toContain('bg-primary-600/30');
    });

    it('switches to Spanish', async () => {
        const user = userEvent.setup();
        renderSwitcher();

        const esButton = screen.getByText('🇪🇸 ES');
        await user.click(esButton);

        expect(esButton.className).toContain('bg-primary-600/30');
    });
});
