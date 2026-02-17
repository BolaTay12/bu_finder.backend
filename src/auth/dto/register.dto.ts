import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

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