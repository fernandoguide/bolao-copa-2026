import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "Nome contém caracteres inválidos",
  })
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;
}
