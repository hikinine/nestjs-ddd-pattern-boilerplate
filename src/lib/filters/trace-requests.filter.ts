import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TraceRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();

    const payload = {
      ...request.body,
      ...request.query,
      ...request.params,
    };
    const method = request.method;
    const path = request.path;
    console.log('');
    console.log('');
    console.log(`🚩🚩  ${method} ${path}  🚩🚩`);
    console.log(`[Payload]: ${JSON.stringify(payload, null, 2)}`);
    console.log('⬇️');

    return next.handle().pipe(
      tap(() => {
        console.log(
          `==================== ${
            Date.now() - now
          }ms =========================`,
        );
      }),
    );
  }
}
