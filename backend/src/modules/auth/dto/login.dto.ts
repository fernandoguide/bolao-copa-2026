import { IsEmail, MaxLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email: string;
}
