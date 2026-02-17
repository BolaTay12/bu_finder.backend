import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { responseStatus } from 'src/db/schema';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @Matches(/@babcock\.edu\.ng$/, {
    message: 'Email must be a valid Babcock University email',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  universityId: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterResponseDto {
  status: responseStatus;
  message: string;
  data: {
    verified: boolean;
  }
}