import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profile } from "src/profile/entities/profile.entity";
import { PaginationModule } from "src/common/pagination/pagination.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],

    imports: [
        PaginationModule,
        TypeOrmModule.forFeature([User, Profile]),
        forwardRef(() => AuthModule),
    ]
})

export class UsersModule {

}