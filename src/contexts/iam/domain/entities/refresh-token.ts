import { Domain } from '@hiki9/rich-domain';
import { Id } from '@hiki9/rich-domain/dist/core';
import { minutes } from '@lib/common';
import { refreshTokenValidation } from './validation/refresh-token';

export interface RefreshTokenProps extends Domain.EntityProps {
  token: string;
  expiresAt: Date;
  userAgent?: string;
}

const hooks = Domain.Hooks({
  validation: refreshTokenValidation,
});

export class RefreshToken extends Domain.Entity<RefreshTokenProps> {
  protected static hooks = hooks;
  public static readonly EXPIRES_AT = 30 * 24 * 60 * 60 * 1000;
  /**
   * The function revokes a token by setting its expiration time to one minute ago.
   */
  public revoke() {
    this.props.expiresAt = new Date(Date.now() - minutes(1));
  }
  /**
   * This function generates a new random token and updates the expiration date and token value of a
   * RefreshToken object.
   * @returns string.  The newly generated `token`.
   */
  public renewAndRefreshTheToken(): string {
    const token = RefreshToken.generateRandomToken();
    this.props.expiresAt = new Date(Date.now() + RefreshToken.EXPIRES_AT);
    this.props.token = token;
    return token;
  }

  /**
   *  Check if the token is valid.
   */
  public isValid() {
    return this.props.expiresAt.getTime() > Date.now();
  }

  get token() {
    return this.props.token;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get userAgent() {
    return this.props.userAgent;
  }

  public static generateRandomToken() {
    return new Id().value + new Id().value + new Id().value;
  }
}
