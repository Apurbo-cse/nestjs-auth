import {
  Injectable,
  HttpException,
  HttpStatus,
  RequestTimeoutException,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAlreadyExistsException } from 'src/exceptions/user-already-exists.exception';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/paginate.interface';
import { HashingProvider } from 'src/auth/provider/hashing.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly paginationProvider: PaginationProvider,
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider
  ) { }

  // 🔹 Get all users with profile
  // 🔹 Get all users with profile and pagination
  public async getAllUsers(
    pageQueryDto: PaginationQueryDto
  ): Promise<Paginated<User>> {
    try {
      return await this.paginationProvider.paginateQuery(
        pageQueryDto,
        this.userRepository,
        {}, // Optional where condition
        ['profile'] // Eager load profile relation
      );
    } catch (error) {
      this.handleDatabaseError(error, 'getAllUsers');
      throw error; // Ensure error is thrown after catching
    }
  }


  // 🔹 Create new user
  async createUser(userDto: CreateUserDto) {
    try {
      userDto.profile ??= {};

      const [existingUsername, existingEmail] = await Promise.all([
        this.userRepository.findOne({ where: { userName: userDto.userName } }),
        this.userRepository.findOne({ where: { email: userDto.email } }),
      ]);

      if (existingUsername) {
        throw new UserAlreadyExistsException('Username', userDto.userName);
      }

      if (existingEmail) {
        throw new UserAlreadyExistsException('Email', userDto.email);
      }

      const newUser = this.userRepository.create({ ...userDto, password: await this.hashingProvider.hashPassword(userDto.password) });

      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDatabaseError(error, 'createUser');
    }
  }

  // 🔹 Delete a user by ID
  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `User with ID ${id} not found.`,
          table: 'user',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return { deleted: true };
  }

  // 🔹 Find user by ID
  async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `User with ID ${id} not found.`,
          table: 'user',
        },
        HttpStatus.NOT_FOUND,
        {
          description: `User ID ${id} was not found in the system.`,
        },
      );
    }

    return user;
  }

  // 🔹 Find user by Username
 public async findUserByUsername(username: string): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { userName: username },
    select: ['id', 'userName', 'password', 'email'],
  });

  if (!user) {
    throw new UnauthorizedException('User does not exist!');
  }

  return user;
}

  // 🔹 Handle connection or other errors
  private handleDatabaseError(error: any, method: string) {
    if (error.code === 'ECONNREFUSED') {
      throw new RequestTimeoutException('Database connection error', {
        description: 'Could not connect to the database.',
      });
    }
    console.error(`${method} error:`, error);
    throw error;
  }
}
