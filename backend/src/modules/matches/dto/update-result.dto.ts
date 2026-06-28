import { IsInt, Min, Max, IsOptional } from "class-validator";

export class UpdateResultDto {
  @IsInt()
  @Min(0)
  @Max(99)
  homeScore: number;

  @IsInt()
  @Min(0)
  @Max(99)
  awayScore: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  homePenalty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99)
  awayPenalty?: number;
}
