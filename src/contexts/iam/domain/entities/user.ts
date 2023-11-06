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
import { OAuth, SignInToken, Username } from '@iam/domain/value-object';
import { Email, Phone } from '@shared/domain';
import { Auth, Group, Permission, RefreshToken } from './';
import { userValidation } from './validation/user';

export interface UserProps extends Domain.EntityProps {
  username: Username;
  email: Email;
  phone: Phone;
  office: string;
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

  /**
   * This function changes the user's password and recovers their account using a recovery token.
   * @ref {RecoveryPassword}
   * @param {string} newPassword - A string representing the new password that the user wants to set.
   * @param {string} recoveryToken - The token parameter is likely a unique identifier that is generated when a
   * user requests to recover their password. This token is usually sent to the user's email address
   * and is used to verify their identity when resetting their password.
   */
  @OnlyActiveUsersCan()
  public recoveryPassword(newPassword: string, recoveryToken: string) {
    this.auth.changePassword(newPassword);
    this.auth.recoveryPassword(recoveryToken);
  }
  /**
   * This function should be used with SignIn
   * @returns a payload object containing the user's ID, username, and combined bitmap
   * permissions for signing in.
   */
  protected getSignInPayload() {
    const payload = {
      id: this.id.value,
      username: this.username.value,
      permissions: this.getCombinedBitmapPermissions(),
    };
    return payload;
  }
  /**
   * The function returns an array of combined bitmap permissions from an array of permissions and an
   * array of groups with their respective permissions.
   * @returns String[] An array of bitmaps representing the combined permissions of the current object's
   * permissions and the permissions of all groups it belongs to.
   */
  public getCombinedBitmapPermissions(): string[] {
    return [
      ...this.permissions.map((perm) => perm.bitmap),
      ...this.groups
        .map((group) => group.permissions.map((perm) => perm.bitmap))
        .flat(),
    ];
  }
  /**
   * The function returns an array of combined permissions from the current object and its associated
   * groups.
   * @returns Permission[]
   */
  public getCombinedPermissions(): Permission[] {
    return [
      ...this.permissions,
      ...this.groups.map((group) => group.permissions).flat(),
    ];
  }
  /**
   * This function checks if a plain text password matches the hashed password stored in the
   * authentication object.
   * @param {string} plainText - A string representing the plain text password that needs to be checked
   * for a match with the hashed password stored in the authentication object.
   * @returns A boolean value is being returned.
   */
  @OnlyActiveUsersCan()
  public passwordMatchsWith(plainText: string): boolean {
    return this.props.auth.passwordMatchs(plainText);
  }
  /**
   * This function restores user access and triggers a UserActiveStatusChangedEvent.
   */
  public restoreUserAccess() {
    this.props.isActive = true;
    this.addEvent(new UserActiveStatusChangedEvent(this));
  }
  /**
   * The function revokes a user's access by setting their isActive property to false, clearing their
   * refreshToken and activeRecoveryPassword
   * @event {UserActiveStatusChangedEvent}.
   */
  public revokeUserAccess() {
    this.props.isActive = false;
    this.props.auth.revokeAllTokens();
    this.addEvent(new UserActiveStatusChangedEvent(this));
  }
  /**
   * The function revokes all permissions, entities access control, and groups from the current object.
   */
  public revokeAllPermissions(): void {
    this.props.permissions = [];
    this.props.entitiesAccessControl = [];
    this.props.groups = [];
  }
  /**
   * This function checks if a user belongs to a specific group.
   * @param {Group} group - The `group` parameter is an instance of the `Group` class, which is being
   * passed as an argument to the `belongsToGroup` method. This method checks if the current user belongs
   * to the specified group by comparing the `id` value of the `group` parameter with the `id`
   * @returns Boolean
   */
  public belongsToGroup(group: Group): boolean {
    return this.props.groups.some(
      (userGroup) => userGroup.id.value === group.id.value,
    );
  }
  /**
   * This function adds a user to a group and logs an event.
   * @param {Group} group - Group object that the user wants to subscribe to.
   */
  @OnlyActiveUsersCan()
  public subscribeTo(group: Group) {
    const alreadyRegistered = this.belongsToGroup(group);
    if (alreadyRegistered) {
      throw new DomainError('Usuário já pertence a esse grupo.');
    }

    this.props.groups.push(group);
    this.addEvent(new UserJoinedOrLeftAnGroupEvent(this, group, 'subscribe'));
  }
  /**
   * This function allows a user to unsubscribe from a group
   * @event UserJoinedOrLeftAnGroupEvent
   * @param {Group} group - Group object that the user wants to unsubscribe from.
   */
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
  /**
   * This function changes the permissions of a given object.
   * @param {Permission[]} permissions - An array of Permission objects that will be used to update the
   * permissions of an object.
   */
  public changePermissions(permissions: Permission[]) {
    this.props.permissions = permissions;
  }

  /**
   * The function checks if a given permission is present in a list of permissions.
   * @param {Permission} permission - The `permission` parameter is an object of type `Permission`.
   * @returns a boolean value.
   */
  public hasPermission(permission: Permission): boolean {
    return this.props.permissions.some(
      (perm) => perm.bitmap === permission.bitmap,
    );
  }

  /**
   * The function checks if a given bitmap is present in an array of permissions.
   * @param {string} bitmap - The `bitmap` parameter is a string that represents a permission bitmap.
   * @returns a boolean value.
   */
  public hasPermissionBitmap(bitmap: string): boolean {
    return this.props.permissions.some((perm) => perm.bitmap === bitmap);
  }
  /**
   * This function changes the phone number of an object's props.
   * @param {Phone} phone - The parameter `phone` is of type `Phone`, which is likely a custom data type
   * representing a phone number. The `changePhone` method is designed to update the `phone` property of
   * the object that it is called on with the new `phone` value passed as an argument. However,
   */
  public changePhone(phone: Phone) {
    this.props.phone = phone;
  }

  /**
   * This function changes the username of an object's props.
   * @param {Username} username
   */
  public changeUsername(username: Username) {
    this.props.username = username;
  }

  public changeOffice(office: string) {
    this.props.office = office;
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

  /**
   * Checks if a user is already registered with a specific OAuth
   * provider and adds the OAuth information to the user's authentication data
   * if they are not already registered.
   * @param {OAuth} oauth
   */
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

  /**
   * The function returns an object with certain properties set to null, in addition to the properties
   * inherited from its parent class.
   * @returns An object is being returned with the properties of the parent class's `toPrimitives()`
   * method, as well as the `auth` and `activeRecoveryPassword` properties set to `null`.
   */
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

  get office() {
    return this.props.office;
  }
  get active() {
    return this.props.isActive;
  }
  get username() {
    return this.props.username;
  }

  get email() {
    return this.props.email;
  }

  get phone() {
    return this.props.phone;
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
