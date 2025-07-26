import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@AllowAnonymous()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signup(createUserDto)
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    public async rereshToken(@Body() refreshTokenDto:RefreshTokenDto){
       return this.authService.RefreshToen(refreshTokenDto)
    }
}
