export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  provider: string;
  externalUserProviderId: string;
}
/**
 * Abstract strategy to authenticate user by using oauth protocol
 */
export abstract class OAuthAuthenticateStrategy<Code = string> {
  /**
   * Fetchs provider oauth url by using code
   * @param code {string}
   */
  abstract generateTokenByUsingCode(code: Code): Promise<OAuthTokenResponse>;
  abstract getUserProfile(token: OAuthTokenResponse): Promise<unknown>;
}
