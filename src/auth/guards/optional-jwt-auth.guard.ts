import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If no user or error (e.g. no token provided), allow request to proceed as anonymous/guest
    if (err || !user) {
      return null;
    }
    return user;
  }
}
