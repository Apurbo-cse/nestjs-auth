import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import authConfig from "../config/auth.config";
import { Reflector } from "@nestjs/core";
import { REQUEST_USER_KEY } from "src/constants/contants";


@Injectable()
export class AuthorizeGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,

        @Inject(authConfig.KEY)
        private readonly authConfiguration: ConfigType<typeof authConfig>,
        private readonly reflector: Reflector
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {

        // Read public Metadata
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass()
        ])

        if (isPublic) {
            return true
        }

        // Extract Request From Execution Context
        const request: Request = context.switchToHttp().getRequest();


        // Extract Token From The Request Header

        // Bearer actual-json-token = ['Bearer', 'actual-json-token]
        const token = request.headers.authorization?.split(' ')[1];

        // Validate Token And Provide / Deny Access
        if (!token) {
            throw new UnauthorizedException()
        }


        try {
            const payload = await this.jwtService.verifyAsync(token, this.authConfiguration)
            request[REQUEST_USER_KEY] = payload
        } catch (error) {
            throw new UnauthorizedException()
        }


        return true;
    }

} 