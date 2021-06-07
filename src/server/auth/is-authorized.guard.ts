import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const isShouldSkipAuth = this.reflector.get<boolean>(
      "should-skip-auth",
      context.getHandler()
    );

    if (isShouldSkipAuth) {
      return true;
    }

    if (!req.session.userId) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
