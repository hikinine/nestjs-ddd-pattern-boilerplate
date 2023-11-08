/* eslint-disable @typescript-eslint/no-var-requires */
import { Domain, DomainError } from '@hiki9/rich-domain';
import {
  UserActiveStatusChangedEvent,
  UserCreatedEvent,
  UserJoinedOrLeftAnGroupEvent,
  UserPasswordWasChangedEvent,
} from '@iam/domain/events';
import { AuthenticateStrategyPolicy } from '@iam/domain/policies';
import * as Rules from '@iam/domain/rules';
import { OnlyActiveUsersCan } from '@iam/domain/rules';
import { OAuth, SignInToken } from '@iam/domain/value-object';
import { Email } from '@shared/domain';
import { Auth, Group, Permission, Profile, RefreshToken } from './';
import { userValidation } from './validation/user';

export interface UserProps extends Domain.EntityProps {
  email: Email;
  profile: Profile;
  auth: Auth;
  groups: Group[];
  permissions: Permission[];
  entitiesAccessControl?: string[];
  isActive: boolean;
}

const hooks = Domain.Hooks<User, UserProps>({
  validation: userValidation,
  onCreate(user) {
    if (user.isNew()) {
      user.addEvent(new UserCreatedEvent(user));
    }
  },
  onChange(user, snapshot) {
    if (snapshot.hasChange('auth.password')) {
      //this should revoke every refresh token
      user.addEvent(new UserPasswordWasChangedEvent(user));
    }
  },
  rules(user) {
    Rules.ensureUserHasNotDuplicatedPermission(user);
  },
});
export class User extends Domain.Aggregate<UserProps> {
  protected static hooks = hooks;
  /**
   * This function signs-in a user by using a refresh token passing an authentication strategy, renewing the
   * refresh token if necessary.
   * @param {string} token - A string representing the refresh token used for authentication.
   * @param {AuthenticateStrategyPolicy} strategy used to sign the payload and generate the access token.
   * @returns SignInToken
   */
  @OnlyActiveUsersCan()
  public signInWithStrategyUsingRefreshToken(
    token: string,
    strategy: AuthenticateStrategyPolicy,
  ): SignInToken {
    const domainRefreshToken = this.getRefreshToken(token);

    if (!domainRefreshToken || !domainRefreshToken.isValid()) {
      throw new DomainError('Token de atualização inválido.');
    }

    const payload = this.getSignInPayload();
    const accessToken = strategy.sign(payload);
    const refreshToken = domainRefreshToken.renewAndRefreshTheToken();
    return new SignInToken({ accessToken, refreshToken });
  }

  /**
   * This function signs in a user with a given authentication strategy and returns a new sign-in token.
   * @param {AuthenticateStrategy} strategy used to sign the payload and generate the access token.
   * @returns SignInToken
   */
  @OnlyActiveUsersCan()
  public signInWithStrategy(strategy: AuthenticateStrategyPolicy): SignInToken {
    const payload = this.getSignInPayload();
    const accessToken = strategy.sign(payload);
    return new SignInToken({ accessToken });
  }

  /**
   * This function generates and adds a new refresh token to the authentication object.
   * @param {string} [userAgent] - The userAgent parameter is an optional string that represents the user
   * agent of the client making the request. It is typically used to identify the type of device or
   * browser being used to access the application.
   * @returns RefreshToken
   */
  @OnlyActiveUsersCan()
  public registerAnRefreshTokenAccess(userAgent?: string) {
    const refreshToken = new RefreshToken({
      token: RefreshToken.generateRandomToken(),
      expiresAt: new Date(Date.now() + RefreshToken.EXPIRES_AT),
      userAgent,
    });

    this.auth.refreshToken.push(refreshToken);
    return refreshToken;
  }
  /**
   * This function returns a refresh token object that matches the given token string.
   * @param {string} token - The token parameter is a string that represents the refresh token that needs
   * to be retrieved.
   * @returns RefreshToken?
   */
  public getRefreshToken(token: string) {
    return this.auth.refreshToken?.find((refresh) => refresh.token === token);
  }

  /**
   * This function revokes a refresh token if it exists.
   * @param {string} token - a string representing the refresh token that needs to be revoked.
   * @returns Boolean.
   */
  public revokeRefreshTokenIfExists(token: string) {
    const domainRefreshToken = this.getRefreshToken(token);
    if (!domainRefreshToken) return false;
    domainRefreshToken.revoke();
    return true;
  }

  /**
   * The function revokes every refresh token.
   */
  public revokeAllRefreshToken() {
    this.auth.refreshToken.forEach((token) => token.revoke());
  }

  /**
   * todo
   */
  public signOut(refreshToken?: string) {
    if (refreshToken) {
      return this.revokeRefreshTokenIfExists(refreshToken);
    }
  }

  /**
   * This function returns a valid recovery password for an ongoing recovery process.
   * @returns RecoveryPassword | null
   */
  @OnlyActiveUsersCan()
  public getOnGoingRecoveryPasswordIfExists() {
    return this.auth.getValidRecoveryPassword();
  }

  /**
   * This function registers a request to recover a password.
   * @returns RecoveryPassword
   */
  @OnlyActiveUsersCan()
  public registerAnRequestToRecoveryPassword() {
    const recovery = this.auth.registerAnRequestToRecoveryPassword();
    return recovery;
  }

  /**
   * Revoke all recovery passwords.
   */
  public revokeAllRecoveryPasswords() {
    this.auth.activeRecoveryPassword.forEach((token) => token.revoke());
  }

  @OnlyActiveUsersCan()
  public recoveryPassword(newPassword: string, recoveryToken: string) {
    this.auth.changePassword(newPassword);
    this.auth.recoveryPassword(recoveryToken);
  }

  protected getSignInPayload() {
    const payload = {
      id: this.id.value,
      email: this.email.value,
      fullName: this.profile.fullName,
      permissions: this.getCombinedBitmapPermissions(),
    };
    return payload;
  }

  public getCombinedBitmapPermissions(): string[] {
    return [
      ...this.permissions.map((perm) => perm.bitmap),
      ...this.groups
        .map((group) => group.permissions.map((perm) => perm.bitmap))
        .flat(),
    ];
  }

  public getCombinedPermissions(): Permission[] {
    return [
      ...this.permissions,
      ...this.groups.map((group) => group.permissions).flat(),
    ];
  }

  @OnlyActiveUsersCan()
  public passwordMatchsWith(plainText: string): boolean {
    return this.props.auth.passwordMatchs(plainText);
  }

  public restoreUserAccess() {
    this.props.isActive = true;
    this.addEvent(new UserActiveStatusChangedEvent(this));
  }

  public revokeUserAccess() {
    this.props.isActive = false;
    this.props.auth.revokeAllTokens();
    this.addEvent(new UserActiveStatusChangedEvent(this));
  }

  public revokeAllPermissions(): void {
    this.props.permissions = [];
    this.props.entitiesAccessControl = [];
    this.props.groups = [];
  }

  public belongsToGroup(group: Group): boolean {
    return this.props.groups.some(
      (userGroup) => userGroup.id.value === group.id.value,
    );
  }

  @OnlyActiveUsersCan()
  public subscribeTo(group: Group) {
    const alreadyRegistered = this.belongsToGroup(group);
    if (alreadyRegistered) {
      throw new DomainError('Usuário já pertence a esse grupo.');
    }

    this.props.groups.push(group);
    this.addEvent(new UserJoinedOrLeftAnGroupEvent(this, group, 'subscribe'));
  }

  @OnlyActiveUsersCan()
  public unsubscribeTo(group: Group) {
    const registered = this.belongsToGroup(group);
    if (!registered) {
      throw new DomainError('Usuário já não pertence a esse grupo.');
    }

    this.props.groups = this.props.groups.filter(
      (userGroup) => !userGroup.id.equal(group.id),
    );
    this.addEvent(new UserJoinedOrLeftAnGroupEvent(this, group, 'unsubscribe'));
  }

  public changePermissions(permissions: Permission[]) {
    this.props.permissions = permissions;
  }

  public hasPermission(permission: Permission): boolean {
    return this.props.permissions.some(
      (perm) => perm.bitmap === permission.bitmap,
    );
  }

  public hasPermissionBitmap(bitmap: string): boolean {
    return this.props.permissions.some((perm) => perm.bitmap === bitmap);
  }

  public revokeAll() {
    this.revokeAllRefreshToken();
    this.revokeAllRecoveryPasswords();
    this.revokeUserAccess();
    this.revokeAllPermissions();
  }

  public isRecoveryPasswordTokenValid(token: string) {
    const recoveryToken = this.auth.activeRecoveryPassword.find(
      (recovery) => recovery.token === token,
    );

    if (!recoveryToken) return false;
    return recoveryToken.isValid();
  }

  public subscribeOAuth(oauth: OAuth) {
    const userProviders = this.getExternalUserProvidersIds();
    const registered = userProviders.some((id) => id === oauth.externalUserId);
    if (registered) {
      throw new DomainError('Usuário já está vinculado a esse provedor.');
    }
    this.props.auth.oauth.push(oauth);
  }

  public getExternalUserProvidersIds(): string[] {
    return (
      this.auth?.oauth?.map(
        (provider) => provider.value.externalUserProviderId,
      ) || []
    );
  }

  public toPrimitives() {
    return {
      ...super.toPrimitives(),
      auth: null,
      activeRecoveryPassword: null,
    };
  }

  public isActive() {
    return this.props.isActive;
  }

  get profile() {
    return this.props.profile;
  }

  get active() {
    return this.props.isActive;
  }

  get email() {
    return this.props.email;
  }

  get auth() {
    return this.props.auth;
  }

  get groups() {
    return this.props.groups;
  }

  get permissions() {
    return this.props.permissions;
  }

  get entitiesAccessControl() {
    return this.props.entitiesAccessControl;
  }
}
