import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import authConfig from './config/auth.config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { ActiveUserType } from './interfaces/active-user-type.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,

    // @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService
  ) { }

  isAuthenticketd: boolean = false;

public async login(loginDto: LoginDto) {
  const { userName, password } = loginDto;

  const isEmailInput = userName.includes('@'); 

  const user = isEmailInput
    ? await this.userService.findUserByEmail(userName)
    : await this.userService.findUserByUsername(userName);

  const isPasswordMatch = await this.hashingProvider.comparePassword(
    password,
    user.password,
  );

  if (!isPasswordMatch) {
    throw new UnauthorizedException('Password is wrong!');
  }

  return this.generateToken(user);
}

  public async signup(createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }


  public async RefreshToen(refreshTokenDto: RefreshTokenDto) {

    try {
      // Verify the Refresh Token
      const { sub } = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.authConfiguration.secret,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer
      })

      // Find the user DB using ID
      const user = await this.userService.findUserById(sub)

      // Generate An Access Token & Refresh Token
      return await this.generateToken(user)

    } catch (error) {

      throw new UnauthorizedException(error)

    }

  }


  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload
      },
      {
        secret: this.authConfiguration.secret,
        expiresIn: expiresIn,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer
      }
    );
  }


  private async generateToken(user: User) {
    // GENERATE AN ACCESS TOKEN
    const accessToken = await this.signToken<Partial<ActiveUserType>>(user.id, this.authConfiguration.expiresIn, { email: user.email })

    //GENERATE A REFRESH TOKEN
    const refreshToken = await this.signToken(user.id, this.authConfiguration.refreshTokenExpiresIn)

    return {
      token: accessToken, refreshToken
    }
  }
}
