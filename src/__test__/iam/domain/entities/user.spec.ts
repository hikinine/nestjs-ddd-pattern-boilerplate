import { Email, Phone } from '@app/contexts/shared/domain';
import { DomainError } from '@hiki9/rich-domain/dist';
import {
  Auth,
  Group,
  Permission,
  Profile,
  RecoveryPassword,
  RefreshToken,
  User,
  UserProps,
} from '@iam/domain/entities';
import { UserPasswordWasChangedEvent } from '@iam/domain/events';
import {
  AuthenticateStrategyPolicy,
  AuthenticateStrategyWithJwtSpecification,
} from '@iam/domain/policies';
import { ensureUserHasNotDuplicatedPermission } from '@iam/domain/rules';
import {
  OAuth,
  Password,
  SignInToken,
  Username,
} from '@iam/domain/value-object';
import { seconds } from '@lib/utils';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('entity user', () => {
  let userProps: UserProps;
  const plainPassword = '12345678';
  beforeEach(() => {
    userProps = {
      profile: new Profile({
        firstName: new Username('username'),
        lastName: new Username('username'),
        office: 'Desenvolvedor',
        phone: new Phone('(71) 99295-6282'),
      }),
      email: new Email('pppppp@gmail.com'),
      isActive: true,
      permissions: [Permission.createFromBitmap('@any.13333333')],
      groups: [],
      auth: new Auth({
        password: Password.createFromPlain(plainPassword),
        refreshToken: [],
        activeRecoveryPassword: [],
      }),
    };
  });

  describe('User basics', () => {
    it('should be defined', () => {
      expect(User).toBeDefined();
    });

    it('should create a valid user', () => {
      const user = new User(userProps);
      expect(user).toBeInstanceOf(User);
      expect(user.profile.firstName).toEqual(userProps.profile.firstName);
      expect(user.email).toEqual(userProps.email);
      expect(user.profile.phone).toEqual(userProps.profile.phone);
      expect(user.active).toEqual(userProps.isActive);
      expect(user.permissions).toEqual(userProps.permissions);
      expect(user.groups).toEqual(userProps.groups);
      expect(user.auth).toEqual(userProps.auth);
    });

    it('should ensure that password is encrypted', () => {
      const user = new User(userProps);
      expect(user.auth.password.value.hash).not.toEqual(plainPassword);
    });

    it('should ensure toPrimitives method doesnt return sensitive data', () => {
      const user = new User(userProps);
      const userPrimitives = user.toPrimitives();
      expect(userPrimitives.auth).toBeNull();
      expect(userPrimitives.activeRecoveryPassword).toBeNull();
      expect(userPrimitives).not.toHaveProperty('password');
      expect(userPrimitives).not.toHaveProperty('refreshToken');
      expect(userPrimitives).not.toHaveProperty('refresh_token');
      expect(userPrimitives).not.toHaveProperty('accessToken');
      expect(userPrimitives).not.toHaveProperty('access_token');
    });

    it('change should phone', () => {
      const user = new User(userProps);
      const newPhone = new Phone('(71) 11111-6282');
      user.profile.changePhone(newPhone);
      expect(user.profile.phone).toEqual(newPhone);
    });

    it('should change office', () => {
      const user = new User(userProps);
      const newOffice = 'new-office';
      user.profile.changeOffice(newOffice);
      expect(user.profile.office).toEqual(newOffice);
    });

    it('should change username', () => {
      const user = new User(userProps);
      const newUsername = new Username('new-username');
      user.profile.changeFirstName(newUsername);
      expect(user.profile.firstName).toEqual(newUsername);
    });

    it('should throw an invalid username', () => {
      const user = new User(userProps);
      expect(() => user.profile.changeFirstName(new Username(''))).toThrow(
        DomainError,
      );
      expect(() =>
        user.profile.changeFirstName(new Username(1 as any)),
      ).toThrow(DomainError);
      expect(() =>
        user.profile.changeFirstName(new Username({} as any)),
      ).toThrow(DomainError);
      expect(() =>
        user.profile.changeFirstName(new Username([] as any)),
      ).toThrow(DomainError);
      expect(() =>
        user.profile.changeFirstName(new Username(false as any)),
      ).toThrow(DomainError);
      expect(() =>
        user.profile.changeFirstName(new Username(null as any)),
      ).toThrow(DomainError);
      expect(() =>
        user.profile.changeFirstName(new Username(undefined as any)),
      ).toThrow(DomainError);
    });

    it('should throw invalid phone', () => {
      const user = new User(userProps);
      expect(() => user.profile.changePhone(new Phone(''))).toThrow(
        DomainError,
      );
      expect(() => user.profile.changePhone(new Phone(1 as any))).toThrow(
        DomainError,
      );
      expect(() => user.profile.changePhone(new Phone({} as any))).toThrow(
        DomainError,
      );
      expect(() => user.profile.changePhone(new Phone([] as any))).toThrow(
        DomainError,
      );
      expect(() => user.profile.changePhone(new Phone(false as any))).toThrow(
        DomainError,
      );
      expect(() => user.profile.changePhone(new Phone(null as any))).toThrow(
        DomainError,
      );
      expect(() =>
        user.profile.changePhone(new Phone(undefined as any)),
      ).toThrow(DomainError);
    });

    it('should throw invalid permission rule', () => {
      expect(
        () =>
          new User({
            ...userProps,
            permissions: [
              Permission.createFromBitmap('@same.13333333'),
              Permission.createFromBitmap('@same.13333333'),
            ],
          }),
      ).toThrow(DomainError);
    });

    it('should throw invalid permission rule on change', () => {
      const user = new User(userProps);
      expect(() =>
        user.changePermissions([
          Permission.createFromBitmap('@same.13333333'),
          Permission.createFromBitmap('@same.13333333'),
        ]),
      ).toThrow(DomainError);
    });

    it('should throw if wrong permission is registered', () => {
      expect(
        () =>
          new User({
            ...userProps,
            permissions: [Permission.createFromBitmap('wrong-rule' as any)],
          }),
      ).toThrow(DomainError);
    });
    it('should throw if wrong permission is updated', () => {
      const user = new User(userProps);
      expect(() =>
        user.changePermissions([
          Permission.createFromBitmap('wrong-rule' as any),
        ]),
      ).toThrow(DomainError);
    });

    it('should change user permissions', () => {
      const user = new User(userProps);
      const permissions = [Permission.createFromBitmap('@any.13333333')];
      user.changePermissions(permissions);
      expect(user.permissions).toEqual(permissions);
      user.changePermissions([]);
      expect(user.permissions).toEqual([]);
    });

    it('should verify if user has permission', () => {
      const user = new User(userProps);
      const permission = Permission.createFromBitmap('@any.13333333');
      user.changePermissions([permission]);
      expect(user.hasPermission(permission)).toBeTruthy();
    });

    it('should verify if user has permission by bitmap', () => {
      const user = new User(userProps);
      const permission = Permission.createFromBitmap('@any.13333333');
      user.changePermissions([permission]);
      expect(user.hasPermissionBitmap(permission.bitmap)).toBeTruthy();
    });

    it('should return that user has no permission', () => {
      const user = new User(userProps);
      expect(user.hasPermissionBitmap('@wrong.4444444')).toBeFalsy();

      expect(
        user.hasPermission(Permission.createFromBitmap('@wrong.23134222')),
      );
    });
  });

  describe('user hooks', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should ensure hooks was being called properly', () => {
      const userRules = jest.spyOn((User as any).hooks, 'rules');

      const onCreate = jest.spyOn((User as any).hooks, 'onCreate');
      const user = new User(userProps);
      expect(user).toBeInstanceOf(User);
      expect(onCreate).toBeCalledWith(user);
      expect(onCreate).toBeCalledTimes(1);

      const onChange = jest.spyOn((User as any).hooks, 'onChange');
      user.profile.changeFirstName(new Username('new-username'));
      expect(onChange).toBeCalledTimes(1);

      expect(userRules).toBeCalledWith(user);
      expect(userRules).toBeCalledTimes(2);
    });

    it('should ensure hooks rules was being called', () => {
      const userRules = jest.spyOn((User as any).hooks, 'rules');

      const props = {
        ...userProps,
        permissions: [
          Permission.createFromBitmap('@same.13333333'),
          Permission.createFromBitmap('@same.13333333'),
        ],
      };
      expect(() => new User(props)).toThrow(DomainError);
      expect(userRules).toBeCalledTimes(1);
    });

    it('should add event after password being changed', () => {
      const onChange = jest.spyOn((User as any).hooks, 'onChange');
      const user = new User(userProps);
      const events = user.getEvents(UserPasswordWasChangedEvent.name);
      expect(events.length).toEqual(0);
      user.auth.changePassword('new-password123222');
      expect(onChange).toBeCalledTimes(1);
      const eventsAfterChange = user.getEvents(
        UserPasswordWasChangedEvent.name,
      );
      expect(eventsAfterChange.length).toEqual(1);
    });

    it('should test hasSomePermissionDuplicated method', () => {
      const user = new User(userProps);
      const permission = Permission.createFromBitmap('@same.13333333');
      user.changePermissions([permission]);
      expect(ensureUserHasNotDuplicatedPermission(user)).toBeFalsy();
    });
  });

  describe('recovery password methods', () => {
    it('should recovery password', () => {
      const user = new User(userProps);
      const recoveryPassword = user.registerAnRequestToRecoveryPassword();
      const spyOnMethod = jest.spyOn(recoveryPassword, 'recovery');
      const newPassword = 'new-password';
      expect(recoveryPassword.passwordWasRecovered).toBeFalsy();
      user.recoveryPassword(newPassword, recoveryPassword.token);
      const recoveryToken = user.auth.activeRecoveryPassword.find(
        (recovery) => recovery.token === recoveryPassword.token,
      );
      expect(spyOnMethod).toHaveBeenCalled();
      expect(recoveryToken.passwordWasRecovered).toBeTruthy();
    });

    it('should recovery password and ensure that invalidate old tokens', () => {
      const user = new User(userProps);
      user.revokeAllRecoveryPasswords();
      for (let i = 0; i < 5; i++) user.registerAnRequestToRecoveryPassword();
      const recoveryPassword = user.registerAnRequestToRecoveryPassword();
      const spyOnMethod = jest.spyOn(recoveryPassword, 'recovery');
      const newPassword = 'new-password';
      expect(user.auth.activeRecoveryPassword.length).toEqual(6);
      expect(recoveryPassword.passwordWasRecovered).toBeFalsy();
      const ensureSomeTokenIsAvailable = user.auth.activeRecoveryPassword.some(
        (recovery) => recovery.isValid(),
      );

      expect(ensureSomeTokenIsAvailable).toBeTruthy();

      user.recoveryPassword(newPassword, recoveryPassword.token);
      const recoveryToken = user.auth.activeRecoveryPassword.find(
        (recovery) => recovery.token === recoveryPassword.token,
      );

      expect(spyOnMethod).toHaveBeenCalled();
      expect(recoveryToken.passwordWasRecovered).toBeTruthy();

      const ensureEveryTokenWasRevoked = user.auth.activeRecoveryPassword.every(
        (recovery) => !recovery.isValid(),
      );
      expect(ensureEveryTokenWasRevoked).toBeTruthy();
    });

    it('should throw if recovery token is invalid', () => {
      const user = new User(userProps);
      expect(() =>
        user.recoveryPassword('new-password', 'invalid-token'),
      ).toThrow(DomainError);
    });

    it('should getOnGoingRecoveryPasswordIfExists', () => {
      const user = new User(userProps);
      user.registerAnRequestToRecoveryPassword();
      expect(user.auth.activeRecoveryPassword.length).toBeGreaterThan(0);
      const recovery = user.getOnGoingRecoveryPasswordIfExists();
      expect(recovery).toBeInstanceOf(RecoveryPassword);
    });

    it('should registerAnRequestToRecoveryPassword', () => {
      const user = new User(userProps);
      const recovery = user.registerAnRequestToRecoveryPassword();
      expect(recovery).toBeInstanceOf(RecoveryPassword);
    });

    it('should revokeAllRecoveryPasswords', () => {
      const user = new User(userProps);
      user.registerAnRequestToRecoveryPassword();
      user.registerAnRequestToRecoveryPassword();
      user.registerAnRequestToRecoveryPassword();

      expect(user.auth.activeRecoveryPassword.length).toBeGreaterThan(0);
      user.revokeAllRecoveryPasswords();
      user.auth.activeRecoveryPassword.forEach((recovery) => {
        expect(recovery.isValid()).toBeFalsy();
      });
    });
  });

  describe('refresh token methods', () => {
    it('should registerAnRefreshTokenAccess', () => {
      const user = new User(userProps);
      const refreshToken = user.registerAnRefreshTokenAccess();
      const timeFromNowTillExpires =
        new Date(refreshToken.expiresAt).getTime() - new Date().getTime();
      const differeceBetweenExpires = Math.abs(
        timeFromNowTillExpires - RefreshToken.EXPIRES_AT,
      );

      expect(refreshToken).toBeInstanceOf(RefreshToken);
      expect(differeceBetweenExpires < seconds(5)).toBeTruthy();
    });

    it('should getRefreshToken', () => {
      const user = new User(userProps);
      const refreshToken = user.registerAnRefreshTokenAccess();
      const refreshTokenFromUser = user.getRefreshToken(refreshToken.token);
      expect(refreshToken).toBeInstanceOf(RefreshToken);
      expect(refreshTokenFromUser).toBeInstanceOf(RefreshToken);
      expect(refreshToken.isEqual(refreshTokenFromUser)).toBeTruthy();
    });

    it('should return undefined case token not exists', () => {
      const user = new User(userProps);
      const refreshTokenFromUser = user.getRefreshToken('invalid-token');
      expect(refreshTokenFromUser).toBeUndefined();
    });

    it('should revokeRefreshTokenIfExists', () => {
      const user = new User(userProps);
      const refreshToken = user.registerAnRefreshTokenAccess();
      const spyOnMethod = jest.spyOn(refreshToken, 'revoke');
      expect(user.auth.refreshToken.length).toBeGreaterThan(0);
      const isRevoked = user.revokeRefreshTokenIfExists(refreshToken.token);
      expect(isRevoked).toBeTruthy();
      expect(spyOnMethod).toHaveBeenCalled();
    });

    it('should not revoke token if not exists', () => {
      const user = new User(userProps);
      const isRevoked = user.revokeRefreshTokenIfExists('invalid-token');
      expect(isRevoked).toBeFalsy();
    });

    it('should revokeAllRefreshTokens', () => {
      const spyOnMethod = jest.spyOn(RefreshToken.prototype, 'revoke');
      const user = new User(userProps);
      user.registerAnRefreshTokenAccess();
      user.registerAnRefreshTokenAccess();
      user.registerAnRefreshTokenAccess();

      const ensureThatUserHasSomeValidTokenBeforeRevoke =
        user.auth.refreshToken.some((refreshToken) => refreshToken.isValid());

      expect(ensureThatUserHasSomeValidTokenBeforeRevoke).toBeTruthy();

      user.revokeAllRefreshToken();
      user.auth.refreshToken.forEach((refreshToken) => {
        expect(refreshToken.isValid()).toBeFalsy();
      });
      expect(spyOnMethod).toHaveBeenCalled();
    });

    it('should revoke everything from user', () => {
      const user = new User(userProps);
      const spyOn1 = jest.spyOn(user, 'revokeAllPermissions');
      const spyOn2 = jest.spyOn(user, 'revokeAllRecoveryPasswords');
      const spyOn3 = jest.spyOn(user, 'revokeAllRefreshToken');
      const spyOn4 = jest.spyOn(user, 'revokeUserAccess');
      user.revokeAll();
      expect(spyOn1).toBeCalledTimes(1);
      expect(spyOn2).toBeCalledTimes(1);
      expect(spyOn3).toBeCalledTimes(1);
      expect(spyOn4).toBeCalledTimes(1);
    });
  });

  describe('sign in and out methods', () => {
    let policy: AuthenticateStrategyPolicy;

    beforeAll(() => {
      const jwtService = new JwtService({
        secret: 'secret',
      });
      policy = new AuthenticateStrategyWithJwtSpecification(jwtService);
    });

    it('it should sign out', () => {
      const user = new User(userProps);
      const spyOnMethod = jest.spyOn(user, 'revokeRefreshTokenIfExists');
      expect(user.signOut()).toBeUndefined();
      expect(spyOnMethod).not.toHaveBeenCalled();

      expect(user.signOut('invalid-token')).toBeFalsy();
      const token = user.registerAnRefreshTokenAccess();
      expect(user.signOut(token.token)).toBeTruthy();
    });
    describe('signInWithStrategy method', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });
      it('should sign in', () => {
        const user = new User(userProps);
        const signInToken = user.signInWithStrategy(policy);
        expect(signInToken).toBeInstanceOf(SignInToken);
        expect(signInToken.value.refreshToken).toBeUndefined();
        expect(signInToken.value.accessToken).toBeDefined();
      });

      it('should ensure if accessToken payload is signed', () => {
        const user = new User(userProps);
        const signInToken = user.signInWithStrategy(policy);
        const userPayload = (user as any).getSignInPayload();
        const payload = policy.verify(signInToken.value.accessToken);
        expect(payload).toMatchObject(userPayload);
      });

      it('should restore user access', () => {
        const user = new User({
          ...userProps,
          isActive: false,
        });
        expect(user.active).toBeFalsy();
        expect(user.hasEvent('UserActiveStatusChangedEvent')).toBeFalsy();
        user.restoreUserAccess();
        expect(user.active).toBeTruthy();
        expect(user.hasEvent('UserActiveStatusChangedEvent')).toBeTruthy();
      });

      it('should revokeAllPermissions', () => {
        const user = new User({
          ...userProps,
          permissions: [Permission.createFromBitmap('@any.13333333')],
          groups: [
            new Group({
              isDepartment: true,
              name: 'group',
              permissions: [Permission.createFromBitmap('@abc.13333333')],
            }),
          ],
          entitiesAccessControl: ['@cdf.13333333', '@abc.13333333'],
        });
        expect(user.permissions.length).toBeGreaterThan(0);

        user.revokeAllPermissions();
        expect(user.permissions.length).toEqual(0);
        expect(user.entitiesAccessControl.length).toEqual(0);
        expect(user.groups.length).toEqual(0);
      });

      it('shouuld subscribe OAuth method', () => {
        const method = jest.spyOn(
          User.prototype,
          'getExternalUserProvidersIds',
        );
        const user = new User(userProps);
        const oauth = new OAuth({
          externalUserProviderId: '999999999',
          provider: 'GOOGLE',
        });
        user.subscribeOAuth(oauth);
        expect(method).toBeCalledTimes(1);
        const found = user.auth.oauth.find((o) => o.isEqual(oauth));
        expect(found).toBeTruthy();
      });
      it('shouuld throw in OAuth method if duplicated registry found', () => {
        const user = new User(userProps);
        const oauth = new OAuth({
          externalUserProviderId: '999999999',
          provider: 'GOOGLE',
        });
        user.subscribeOAuth(oauth);
        expect(() => user.subscribeOAuth(oauth)).toThrow(DomainError);
      });
      it('method getExternalUserProvidersIds', () => {
        const providerId1 = '999999999';
        const providerId2 = '999999998';
        const user = new User(userProps);
        user.auth.revokeAllTokens();
        const oauth1 = new OAuth({
          externalUserProviderId: providerId1,
          provider: 'GOOGLE',
        });
        const oauth2 = new OAuth({
          externalUserProviderId: providerId2,
          provider: 'GOOGLE',
        });
        user.subscribeOAuth(oauth1);
        user.subscribeOAuth(oauth2);
        const tokens = user.getExternalUserProvidersIds();
        expect(tokens).toBeInstanceOf(Array);
        expect(tokens.length).toEqual(2);
        expect(tokens).toContain(providerId1);
        expect(tokens).toContain(providerId2);
      });
    });
    describe('signInWithStrategyUsingRefreshToken method', () => {
      it('should matchs encrypted password', () => {
        const user = new User(userProps);
        expect(user.passwordMatchsWith(plainPassword)).toBeTruthy();
      });
      it('should not sign in if user is not active', () => {
        const user = new User(userProps);
        user.revokeUserAccess();
        expect(() => user.signInWithStrategy(policy)).toThrow(
          ForbiddenException,
        );
      });
      it('should sign in', () => {
        const user = new User(userProps);
        const refreshToken = user.registerAnRefreshTokenAccess();
        const signInToken = user.signInWithStrategyUsingRefreshToken(
          refreshToken.token,
          policy,
        );
        expect(signInToken).toBeInstanceOf(SignInToken);
        expect(signInToken.value.refreshToken).toEqual(refreshToken.token);
        expect(signInToken.value.accessToken).toBeDefined();
      });

      it('should ensure if accessToken payload is signed', () => {
        const user = new User(userProps);
        const refreshToken = user.registerAnRefreshTokenAccess();
        const signInToken = user.signInWithStrategyUsingRefreshToken(
          refreshToken.token,
          policy,
        );
        const userPayload = (user as any).getSignInPayload();
        const payload = policy.verify(signInToken.value.accessToken);
        expect(payload).toMatchObject(userPayload);
      });

      it('should throw if provided token if not valid', () => {
        const user = new User(userProps);
        expect(() =>
          user.signInWithStrategyUsingRefreshToken('invalid-token', policy),
        ).toThrow(DomainError);
      });

      it('should throw if provided token is expired', () => {
        const user = new User(userProps);
        const refreshToken = user.registerAnRefreshTokenAccess();
        refreshToken.revoke();
        expect(() =>
          user.signInWithStrategyUsingRefreshToken(refreshToken.token, policy),
        ).toThrow(DomainError);
      });

      it('should throw with invalid token type', () => {
        const user = new User(userProps);
        expect(() =>
          user.signInWithStrategyUsingRefreshToken(1 as any, policy),
        ).toThrow(DomainError);
        expect(() =>
          user.signInWithStrategyUsingRefreshToken(null as any, policy),
        ).toThrow(DomainError);

        expect(() =>
          user.signInWithStrategyUsingRefreshToken(undefined as any, policy),
        ).toThrow(DomainError);

        expect(() =>
          user.signInWithStrategyUsingRefreshToken({} as any, policy),
        ).toThrow(DomainError);

        expect(() =>
          user.signInWithStrategyUsingRefreshToken(true as any, policy),
        ).toThrow(DomainError);

        expect(() =>
          user.signInWithStrategyUsingRefreshToken([] as any, policy),
        ).toThrow(DomainError);
      });
    });
  });

  describe('groups and permissions', () => {
    let userPropsWithPermission: UserProps;
    const bitmapIam = '@iam.13333333';

    const userPermissions = [
      Permission.createFromBitmap(bitmapIam),
      Permission.createFromBitmap('@any.13333333'),
    ];
    const groupPermissions = [Permission.createFromBitmap('@other.13333333')];

    beforeEach(() => {
      userPropsWithPermission = {
        ...userProps,
        permissions: userPermissions,
        groups: [
          new Group({
            name: 'group',
            isDepartment: true,
            permissions: groupPermissions,
          }),
        ],
      };
    });
    it('should getCombinedBitmapPermissions', () => {
      const user = new User(userPropsWithPermission);
      const permissions = user.getCombinedBitmapPermissions();
      expect(permissions).toBeInstanceOf(Array);
      expect(permissions[0]).toEqual(bitmapIam);

      expect(permissions.length).toEqual(
        groupPermissions.length + userPermissions.length,
      );
    });

    it('should getCombinedPermissions', () => {
      const user = new User(userPropsWithPermission);
      const permissions = user.getCombinedPermissions();
      expect(permissions).toBeInstanceOf(Array);
      permissions.forEach((permission) => {
        expect(permission).toBeInstanceOf(Permission);
      });

      expect(permissions.length).toEqual(
        groupPermissions.length + userPermissions.length,
      );
    });
  });

  describe('groups methods', () => {
    it('should check if user belongs to group', () => {
      const user = new User(userProps);
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      expect(user.belongsToGroup(group)).toBeFalsy();
    });

    it('should ensure that user belongs to group', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User({
        ...userProps,
        groups: [group],
      });

      expect(user.belongsToGroup(group)).toBeTruthy();
    });

    it('should subscribe into a group', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User(userProps);
      const userGroupsLength = user.groups.length;
      user.subscribeTo(group);
      expect(user.groups.length).toEqual(userGroupsLength + 1);
    });

    it('should throw that user is already registered in the group', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User({
        ...userProps,
        groups: [...userProps.groups, group],
      });
      expect(() => user.subscribeTo(group)).toThrow(DomainError);
    });

    it('should ensure that event is added to aggregate queue', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User(userProps);
      user.subscribeTo(group);
      expect(user.hasEvent('UserJoinedOrLeftAnGroupEvent')).toBeTruthy();
    });

    it('should unsubscribe from group', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User({
        ...userProps,
        groups: [group],
      });
      const userGroupsLength = user.groups.length;
      user.unsubscribeTo(group);
      expect(user.groups.length).toEqual(userGroupsLength - 1);
      expect(user.groups.find((g) => g.isEqual(group))).toBeFalsy();
    });

    it('should throw if user is inactive and try to unsubscribe', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User({
        ...userProps,
        isActive: false,
        groups: [group],
      });
      expect(() => user.unsubscribeTo(group)).toThrow(ForbiddenException);
    });

    it('should throw that user is not registered in the group', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User(userProps);
      expect(() => user.unsubscribeTo(group)).toThrow(DomainError);
    });

    it('should ensure that event is added to aggregate queue', () => {
      const group = new Group({
        name: 'random-group',
        isDepartment: true,
        permissions: [],
      });
      const user = new User({
        ...userProps,
        groups: [group],
      });
      user.unsubscribeTo(group);
      expect(user.hasEvent('UserJoinedOrLeftAnGroupEvent')).toBeTruthy();
    });
  });
});
