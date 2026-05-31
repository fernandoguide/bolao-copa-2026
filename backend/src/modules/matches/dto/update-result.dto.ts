import { IsInt, Min, Max } from "class-validator";

export class UpdateResultDto {
  @IsInt()
  @Min(0)
  @Max(99)
  homeScore: number;

  @IsInt()
  @Min(0)
  @Max(99)
  awayScore: number;
}
