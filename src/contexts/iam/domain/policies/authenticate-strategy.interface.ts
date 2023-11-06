export abstract class AuthenticateStrategyPolicy<T = any> {
  abstract sign(payload: T): string;
  abstract verify(token: string): T;
}
