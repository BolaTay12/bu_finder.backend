import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { responseStatus } from 'src/db/schema';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@babcock.edu.ng', description: 'Babcock University email' })
  @IsEmail()
  @Matches(/(@student\.babcock\.edu\.ng|@babcock\.edu\.ng|@staff\.babcock\.edu\.ng)$/, {
    message: 'Email must be a valid Babcock University email',
  })
  email: string;

  @ApiProperty({ example: '22/1234', description: 'University ID' })
  @IsString()
  @IsNotEmpty()
  universityId: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'Password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: responseStatus.SUCCESS, description: 'Response status' })
  status: responseStatus;

  @ApiProperty({ example: 'verification email sent', description: 'Response message' })
  message: string;

  @ApiProperty({ example: { verified: false }, description: 'Data containing email verification status' })
  data: {
    verified: boolean;
  }
}
