import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private jwtSevice: JwtService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token)
            throw new UnauthorizedException('TOKEN is required!');
        console.log({request});
        try {
            const payload = await this.jwtSevice.verifyAsync<JwtPayload>(
                token,
                {
                    secret: process.env.JWT_SEED
                }
            );
            const user = await this.authService.findUserById(payload.id);
            if (!user) throw new UnauthorizedException('The credentials provided does NOT match any user instance in our records.');
            if (!user.isActive) throw new UnauthorizedException('User is not active.');
            console.log({user});
            request['user'] = user;
        } catch (error) {
            throw new UnauthorizedException();
        }
        return Promise.resolve(true);
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ');
        return type === 'Bearer' ? token: undefined;
    }
}