import { describe, it, expect } from "vitest";
import { ptBR } from "../i18n/pt-br";
import { es } from "../i18n/es";
import { en } from "../i18n/en";
import { Translations } from "../i18n/types";

function getKeys(obj: Translations): string[] {
  return Object.keys(obj).sort();
}

describe("Translation completeness", () => {
  const ptKeys = getKeys(ptBR);
  const esKeys = getKeys(es);
  const enKeys = getKeys(en);

  it("all locales have the same keys", () => {
    expect(esKeys).toEqual(ptKeys);
    expect(enKeys).toEqual(ptKeys);
  });

  it("no translation value is empty string", () => {
    const checkEmpty = (translations: Translations, locale: string) => {
      for (const [key, value] of Object.entries(translations)) {
        if (typeof value === "string") {
          expect(
            value.trim().length,
            `${locale}.${key} is empty`
          ).toBeGreaterThan(0);
        }
        if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            expect(
              item.trim().length,
              `${locale}.${key}[${idx}] is empty`
            ).toBeGreaterThan(0);
          });
        }
      }
    };

    checkEmpty(ptBR, "pt-br");
    checkEmpty(es, "es");
    checkEmpty(en, "en");
  });

  it("array translations have same length across locales", () => {
    for (const key of ptKeys) {
      const ptVal = (ptBR as unknown as Record<string, unknown>)[key];
      const esVal = (es as unknown as Record<string, unknown>)[key];
      const enVal = (en as unknown as Record<string, unknown>)[key];

      if (Array.isArray(ptVal)) {
        expect(Array.isArray(esVal), `es.${key} should be array`).toBe(true);
        expect(Array.isArray(enVal), `en.${key} should be array`).toBe(true);
        expect(
          (esVal as string[]).length,
          `es.${key} array length mismatch`
        ).toBe(ptVal.length);
        expect(
          (enVal as string[]).length,
          `en.${key} array length mismatch`
        ).toBe(ptVal.length);
      }
    }
  });

  it("pt-br has expected core translations", () => {
    expect(ptBR.loading).toBe("Carregando...");
    expect(ptBR.loginSubmit).toBe("Entrar");
    expect(ptBR.logout).toBe("Sair");
    expect(ptBR.navMatches).toContain("Jogos");
  });

  it("en has expected core translations", () => {
    expect(en.loading).toBe("Loading...");
    expect(en.loginSubmit).toBe("Log In");
    expect(en.logout).toBe("Logout");
    expect(en.navMatches).toContain("Matches");
  });

  it("es has expected core translations", () => {
    expect(es.loading).toBe("Cargando...");
    expect(es.loginSubmit).toBe("Entrar");
    expect(es.logout).toBe("Salir");
    expect(es.navMatches).toContain("Partidos");
  });
});
