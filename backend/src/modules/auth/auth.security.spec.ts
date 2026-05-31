import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("Auth Security Tests", () => {
  let app: INestApplication;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({
        access_token: "token",
        user: { id: "1", name: "Test", email: "test@test.com", role: "user" },
      }),
      login: jest.fn().mockResolvedValue({
        access_token: "token",
        user: { id: "1", name: "Test", email: "test@test.com", role: "user" },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Input Validation - SQL Injection Prevention", () => {
    it("deve rejeitar email com SQL injection no login", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "' OR 1=1; --" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar email com script tag no login", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "<script>alert('xss')</script>@test.com" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar campo extra não permitido no login", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "test@test.com", role: "admin" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar campo extra não permitido no registro", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ name: "Test", email: "test@test.com", role: "admin" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar nome com caracteres maliciosos no registro", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ name: "<script>alert(1)</script>", email: "test@test.com" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar nome com SQL injection no registro", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ name: "'; DROP TABLE users; --", email: "test@test.com" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar email vazio no login", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar registro sem nome", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar email muito longo", async () => {
      const longEmail = "a".repeat(300) + "@test.com";
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: longEmail });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar nome muito curto no registro", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ name: "A", email: "test@test.com" });

      expect(res.status).toBe(400);
    });
  });

  describe("Rate Limiting", () => {
    it("deve aplicar rate limiting após muitas tentativas de login", async () => {
      // Faz requisições sequencialmente para evitar ECONNRESET
      // Login permite 10 requests por 5 minutos
      let blocked = false;
      for (let i = 0; i < 12; i++) {
        const res = await request(app.getHttpServer())
          .post("/auth/login")
          .send({ email: `test${i}@test.com` });

        if (res.status === 429) {
          blocked = true;
          break;
        }
      }

      expect(blocked).toBe(true);
    });

    it("deve retornar 429 quando rate limit atingido no registro", async () => {
      let blocked = false;
      for (let i = 0; i < 8; i++) {
        const res = await request(app.getHttpServer())
          .post("/auth/register")
          .send({ name: "Test User", email: `test${i}@test.com` });

        if (res.status === 429) {
          blocked = true;
          break;
        }
      }

      expect(blocked).toBe(true);
    });
  });

  describe("Data Exposure Prevention", () => {
    it("não deve aceitar body vazio no login", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({});

      expect(res.status).toBe(400);
    });

    it("não deve aceitar body vazio no registro", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
