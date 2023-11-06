import { SignInToken } from '@iam/domain/value-object';

export class SignInOutput {
  public readonly accessToken: string;
  public readonly refreshToken?: string;

  constructor(signIn: SignInToken) {
    this.accessToken = signIn.value.accessToken;
    this.refreshToken = signIn.value.refreshToken;
  }
}
