import { IsString, MinLength } from "class-validator";

export class JoinPoolDto {
  @IsString()
  @MinLength(1)
  inviteCode: string;
}
