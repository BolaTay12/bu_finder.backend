import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { RegisterDto, LoginDto, LoginResponseDto, RegisterResponseDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { AUTH_SERVICE, type IAuthService } from './interfaces';
import { responseStatus } from 'src/db/schema';
import { GetProfileResponseDto } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor( 
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService
) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const result = await this.authService.register(dto);
    return {
      status: responseStatus.SUCCESS,
      message: 'verification email sent',
      data: {
        verified: result.emailVerified!,
      }
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
      const result = await this.authService.login(dto);
      return {
        status: responseStatus.SUCCESS,
        message: 'Login successful',
        data: {
            accessToken: result.accessToken!,
        }
      };
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('id') userId: string): Promise<GetProfileResponseDto> {
    return this.authService.getProfile(userId);
  }
}