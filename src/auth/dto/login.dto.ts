import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { responseStatus } from 'src/db/schema/enums';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  status: responseStatus;
  message: string;
  data: {
    accessToken: string;
  }
}