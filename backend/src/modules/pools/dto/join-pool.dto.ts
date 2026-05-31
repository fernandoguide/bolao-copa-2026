import { IsString, MinLength, MaxLength, Matches } from "class-validator";

export class JoinPoolDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: "Código de convite contém caracteres inválidos",
  })
  inviteCode: string;
}
