import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PoolsController } from "./pools.controller";
import { PoolsService } from "./pools.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

describe("Pools Security Tests", () => {
  let app: INestApplication;
  let poolsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    poolsService = {
      create: jest.fn().mockResolvedValue({ id: 1, name: "Pool" }),
      joinByCode: jest.fn().mockResolvedValue({ id: 1 }),
      findMyPools: jest.fn().mockResolvedValue([]),
      findPoolWithMembers: jest.fn().mockResolvedValue({ id: 1 }),
      leavePool: jest.fn().mockResolvedValue(undefined),
      deletePool: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoolsController],
      providers: [{ provide: PoolsService, useValue: poolsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: "user-1", role: "user" };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Create Pool - Input Validation", () => {
    it("deve rejeitar nome com caracteres especiais perigosos", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools")
        .send({ name: "<script>alert(1)</script>" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar nome com SQL injection", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools")
        .send({ name: "'; DROP TABLE pools; --" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar nome muito curto", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools")
        .send({ name: "ab" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar nome muito longo (>100 chars)", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools")
        .send({ name: "a".repeat(101) });

      expect(res.status).toBe(400);
    });

    it("deve aceitar nome válido com acentos", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools")
        .send({ name: "Bolão da Família" });

      expect(res.status).toBe(201);
    });

    it("deve rejeitar campos extras não permitidos", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools")
        .send({ name: "Pool Válido", ownerId: "hacker-id" });

      expect(res.status).toBe(400);
    });
  });

  describe("Join Pool - Input Validation", () => {
    it("deve rejeitar código com caracteres especiais", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools/join")
        .send({ inviteCode: "abc<script>" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar código com SQL injection", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools/join")
        .send({ inviteCode: "' OR 1=1; --" });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar código muito longo (>50 chars)", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools/join")
        .send({ inviteCode: "a".repeat(51) });

      expect(res.status).toBe(400);
    });

    it("deve aceitar código alfanumérico válido", async () => {
      const res = await request(app.getHttpServer())
        .post("/pools/join")
        .send({ inviteCode: "abc-123-def" });

      expect(res.status).toBe(201);
    });
  });

  describe("Parameter Validation - ParseIntPipe", () => {
    it("deve rejeitar id de pool não numérico", async () => {
      const res = await request(app.getHttpServer()).get("/pools/abc");
      expect(res.status).toBe(400);
    });

    it("deve rejeitar id com SQL injection", async () => {
      const res = await request(app.getHttpServer()).get(
        "/pools/1;DROP TABLE pools"
      );
      expect(res.status).toBe(400);
    });
  });
});
