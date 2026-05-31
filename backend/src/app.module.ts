import { Module, Controller, Get } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { join } from "path";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { TeamsModule } from "./modules/teams/teams.module";
import { MatchesModule } from "./modules/matches/matches.module";
import { PredictionsModule } from "./modules/predictions/predictions.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { PoolsModule } from "./modules/pools/pools.module";

@Controller()
export class HealthController {
  @Get()
  health() {
    return { status: "ok" };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global: 60 requests por minuto por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>("DATABASE_URL") || "";
        return {
          type: "postgres" as const,
          url: dbUrl,
          ssl: dbUrl.includes("localhost")
            ? false
            : { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: false,
          migrations: [join(__dirname, "migrations", "*.js")],
          migrationsRun: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    MatchesModule,
    PredictionsModule,
    LeaderboardModule,
    PoolsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
