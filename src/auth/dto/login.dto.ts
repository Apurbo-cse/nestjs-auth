// login.dto.ts
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  userName: string; // can be email or username

  @IsNotEmpty()
  @IsString()
  password: string;
}
