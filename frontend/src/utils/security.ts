/**
 * Utilitários de validação e sanitização para o frontend.
 * Espelha as regras do backend para prevenir requisições inválidas.
 */

// Remove tags HTML e caracteres perigosos
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

// Valida email básico (o backend também valida)
export function isValidEmail(email: string): boolean {
  if (email.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valida nome: 2-100 chars, só letras/espaços/acentos/hifens
export function isValidName(name: string): boolean {
  if (name.length < 2 || name.length > 100) return false;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nameRegex.test(name);
}

// Valida score: inteiro entre 0 e 99
export function isValidScore(value: string): boolean {
  if (value === "") return true; // campo vazio é permitido até submit
  const num = Number(value);
  return Number.isInteger(num) && num >= 0 && num <= 99;
}

// Valida nome de pool: 3-100 chars, alfanumérico + acentos
export function isValidPoolName(name: string): boolean {
  if (name.length < 3 || name.length > 100) return false;
  const poolRegex = /^[a-zA-ZÀ-ÿ0-9\s'-]+$/;
  return poolRegex.test(name);
}

// Valida código de convite: alfanumérico + hífen, 1-50 chars
export function isValidInviteCode(code: string): boolean {
  if (code.length < 1 || code.length > 50) return false;
  const codeRegex = /^[a-zA-Z0-9-]+$/;
  return codeRegex.test(code);
}

/**
 * Rate limiter simples para o client-side.
 * Previne spam de requests do usuário.
 */
export class ClientRateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }

  getTimeUntilNext(): number {
    if (this.timestamps.length < this.maxRequests) return 0;
    const oldest = this.timestamps[0];
    return this.windowMs - (Date.now() - oldest);
  }
}

// Instâncias de rate limiter para ações críticas
export const authLimiter = new ClientRateLimiter(5, 60000); // 5 tentativas/min
export const predictionLimiter = new ClientRateLimiter(30, 60000); // 30 palpites/min
