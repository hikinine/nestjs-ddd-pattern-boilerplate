import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticateStrategyPolicy } from './authenticate-strategy.interface';

@Injectable()
export class AuthenticateStrategyWithJwtSpecification extends AuthenticateStrategyPolicy {
  constructor(public readonly jwtService: JwtService) {
    super();
  }

  public sign(payload: any): string {
    return this.jwtService.sign(payload);
  }

  public verify(token: string): any {
    return this.jwtService.verify(token);
  }
}
