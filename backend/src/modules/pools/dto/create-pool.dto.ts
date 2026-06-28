import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreatePoolDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ0-9\s'-]+$/, {
    message: "Nome do bolão contém caracteres inválidos",
  })
  name: string;

  @IsOptional()
  @IsBoolean()
  knockoutOnly?: boolean;
}
