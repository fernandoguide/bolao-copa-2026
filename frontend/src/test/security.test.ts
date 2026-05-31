import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  isValidEmail,
  isValidName,
  isValidScore,
  isValidPoolName,
  isValidInviteCode,
  ClientRateLimiter,
} from "../utils/security";

describe("Security Utils", () => {
  describe("sanitizeText", () => {
    it("remove tags HTML", () => {
      expect(sanitizeText("<script>alert('xss')</script>")).toBe(
        "scriptalert('xss')/script"
      );
    });

    it("remove javascript: protocol", () => {
      expect(sanitizeText("javascript:alert(1)")).toBe("alert(1)");
    });

    it("remove event handlers", () => {
      expect(sanitizeText("onerror=alert(1)")).toBe("alert(1)");
    });

    it("mantém texto normal", () => {
      expect(sanitizeText("João da Silva")).toBe("João da Silva");
    });

    it("faz trim", () => {
      expect(sanitizeText("  teste  ")).toBe("teste");
    });
  });

  describe("isValidEmail", () => {
    it("aceita email válido", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("rejeita email sem @", () => {
      expect(isValidEmail("testexample.com")).toBe(false);
    });

    it("rejeita email sem domínio", () => {
      expect(isValidEmail("test@")).toBe(false);
    });

    it("rejeita email muito longo (>255)", () => {
      expect(isValidEmail("a".repeat(250) + "@test.com")).toBe(false);
    });

    it("rejeita SQL injection no email", () => {
      expect(isValidEmail("' OR 1=1; --")).toBe(false);
    });

    it("rejeita string vazia", () => {
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidName", () => {
    it("aceita nome válido", () => {
      expect(isValidName("João Silva")).toBe(true);
    });

    it("aceita nome com acentos", () => {
      expect(isValidName("José María")).toBe(true);
    });

    it("aceita nome com hífen e apóstrofo", () => {
      expect(isValidName("O'Brien-Santos")).toBe(true);
    });

    it("rejeita nome muito curto (<2)", () => {
      expect(isValidName("A")).toBe(false);
    });

    it("rejeita nome muito longo (>100)", () => {
      expect(isValidName("A".repeat(101))).toBe(false);
    });

    it("rejeita nome com números", () => {
      expect(isValidName("João123")).toBe(false);
    });

    it("rejeita nome com script", () => {
      expect(isValidName("<script>")).toBe(false);
    });

    it("rejeita SQL injection", () => {
      expect(isValidName("'; DROP TABLE users; --")).toBe(false);
    });
  });

  describe("isValidScore", () => {
    it("aceita score 0", () => {
      expect(isValidScore("0")).toBe(true);
    });

    it("aceita score 99", () => {
      expect(isValidScore("99")).toBe(true);
    });

    it("aceita string vazia (campo incompleto)", () => {
      expect(isValidScore("")).toBe(true);
    });

    it("rejeita score negativo", () => {
      expect(isValidScore("-1")).toBe(false);
    });

    it("rejeita score > 99", () => {
      expect(isValidScore("100")).toBe(false);
    });

    it("rejeita score decimal", () => {
      expect(isValidScore("1.5")).toBe(false);
    });

    it("rejeita texto", () => {
      expect(isValidScore("abc")).toBe(false);
    });
  });

  describe("isValidPoolName", () => {
    it("aceita nome válido", () => {
      expect(isValidPoolName("Bolão da Família")).toBe(true);
    });

    it("aceita nome com números", () => {
      expect(isValidPoolName("Bolão 2026")).toBe(true);
    });

    it("rejeita nome com caracteres especiais perigosos", () => {
      expect(isValidPoolName("<script>alert(1)</script>")).toBe(false);
    });

    it("rejeita nome muito curto (<3)", () => {
      expect(isValidPoolName("ab")).toBe(false);
    });

    it("rejeita nome muito longo (>100)", () => {
      expect(isValidPoolName("a".repeat(101))).toBe(false);
    });

    it("rejeita SQL injection", () => {
      expect(isValidPoolName("'; DROP TABLE pools; --")).toBe(false);
    });
  });

  describe("isValidInviteCode", () => {
    it("aceita código alfanumérico", () => {
      expect(isValidInviteCode("abc-123-def")).toBe(true);
    });

    it("rejeita código com espaços", () => {
      expect(isValidInviteCode("abc 123")).toBe(false);
    });

    it("rejeita código com caracteres especiais", () => {
      expect(isValidInviteCode("abc<script>")).toBe(false);
    });

    it("rejeita código muito longo (>50)", () => {
      expect(isValidInviteCode("a".repeat(51))).toBe(false);
    });

    it("rejeita SQL injection", () => {
      expect(isValidInviteCode("' OR 1=1; --")).toBe(false);
    });

    it("rejeita código vazio", () => {
      expect(isValidInviteCode("")).toBe(false);
    });
  });

  describe("ClientRateLimiter", () => {
    it("permite requests dentro do limite", () => {
      const limiter = new ClientRateLimiter(3, 60000);
      expect(limiter.canProceed()).toBe(true);
      expect(limiter.canProceed()).toBe(true);
      expect(limiter.canProceed()).toBe(true);
    });

    it("bloqueia após exceder o limite", () => {
      const limiter = new ClientRateLimiter(2, 60000);
      limiter.canProceed();
      limiter.canProceed();
      expect(limiter.canProceed()).toBe(false);
    });

    it("retorna tempo até próxima tentativa", () => {
      const limiter = new ClientRateLimiter(1, 60000);
      limiter.canProceed();
      expect(limiter.getTimeUntilNext()).toBeGreaterThan(0);
      expect(limiter.getTimeUntilNext()).toBeLessThanOrEqual(60000);
    });

    it("permite novamente após a janela expirar", () => {
      const limiter = new ClientRateLimiter(1, 10);
      limiter.canProceed();
      // Simula passagem de tempo
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(limiter.canProceed()).toBe(true);
          resolve();
        }, 15);
      });
    });
  });
});
