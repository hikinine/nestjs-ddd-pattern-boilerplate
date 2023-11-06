import { DomainError } from '@hiki9/rich-domain/dist';
import {
  Auth,
  AuthProps,
  RecoveryPassword,
  RefreshToken,
} from '@iam/domain/entities';
import { Password } from '@iam/domain/value-object';
import { minutes } from '@lib/utils';

describe('auth entity', () => {
  let authProps: AuthProps;
  const oneHourFromNow = () => new Date(Date.now() + minutes(60));
  const defaultPlainPassword = '12345678';
  beforeEach(() => {
    authProps = {
      password: Password.createFromPlain(defaultPlainPassword),
      refreshToken: [
        new RefreshToken({
          token: 'token',
          expiresAt: oneHourFromNow(),
        }),
      ],
      activeRecoveryPassword: [
        new RecoveryPassword({
          passwordWasRecovered: false,
          expiresAt: oneHourFromNow(),
        }),
      ],
    };
  });

  describe('auth entity basics', () => {
    it('should be defined', () => {
      expect(Auth).toBeTruthy();
    });

    it('should create an valid auth', () => {
      const auth = new Auth(authProps);
      expect(auth).toBeInstanceOf(Auth);
    });

    it('should ensure that every type matchs with expected', () => {
      const auth = new Auth(authProps);
      expect(auth.password).toBeInstanceOf(Password);
      expect(auth.refreshToken).toBeInstanceOf(Array);
      expect(auth.activeRecoveryPassword).toBeInstanceOf(Array);
      expect(
        auth.activeRecoveryPassword.every(
          (recoveryPassword) => recoveryPassword instanceof RecoveryPassword,
        ),
      ).toBeTruthy();
      expect(
        auth.refreshToken.every((token) => token instanceof RefreshToken),
      ).toBeTruthy();
    });

    it('should  hook transformBeforeCreate', () => {
      const auth = new Auth({
        password: Password.createFromPlain(defaultPlainPassword),
      });

      expect(auth.refreshToken).toBeInstanceOf(Array);
      expect(auth.activeRecoveryPassword).toBeInstanceOf(Array);
    });
  });

  describe('auth entity methods', () => {
    it('should revoke all tokens', () => {
      const auth = new Auth(authProps);
      expect(auth.refreshToken.length).toEqual(authProps.refreshToken.length);
      expect(auth.activeRecoveryPassword.length).toEqual(
        auth.activeRecoveryPassword.length,
      );
      auth.revokeAllTokens();
      expect(auth.refreshToken.length).toEqual(0);
      expect(auth.activeRecoveryPassword.length).toEqual(0);
    });

    it('should recovery password', () => {
      const toRecoveryPassword = new RecoveryPassword({
        passwordWasRecovered: false,
        expiresAt: oneHourFromNow(),
      });

      const toInvalidateRecoveryPassword = new RecoveryPassword({
        passwordWasRecovered: false,
        expiresAt: oneHourFromNow(),
      });

      const auth = new Auth({
        ...authProps,
        activeRecoveryPassword: [
          toRecoveryPassword,
          toInvalidateRecoveryPassword,
        ],
      });

      expect(toRecoveryPassword.isValid()).toBeTruthy();
      expect(toInvalidateRecoveryPassword.isValid()).toBeTruthy();
      auth.recoveryPassword(toRecoveryPassword.token);

      expect(toRecoveryPassword.isValid()).toBeFalsy();
      expect(toRecoveryPassword.passwordWasRecovered).toBeTruthy();
      expect(toRecoveryPassword.passwordWasRecoveredAt).toBeInstanceOf(Date);

      expect(toInvalidateRecoveryPassword.isValid()).toBeFalsy();

      expect(
        auth.activeRecoveryPassword.some((recoveryPassword) =>
          recoveryPassword.isValid(),
        ),
      ).toBeFalsy();
    });

    it('should register an request to recovery password', () => {
      const auth = new Auth(authProps);
      const initialPropsLength = authProps.activeRecoveryPassword.length;
      expect(auth.activeRecoveryPassword.length).toEqual(initialPropsLength);
      const token = auth.registerAnRequestToRecoveryPassword();
      expect(token).toBeInstanceOf(RecoveryPassword);
      expect(auth.activeRecoveryPassword.length).toEqual(
        initialPropsLength + 1,
      );

      expect(
        auth.activeRecoveryPassword.every(
          (recoveryPassword) => recoveryPassword instanceof RecoveryPassword,
        ),
      ).toBeTruthy();
    });

    it('should get valid recovery password if exists', () => {
      const auth = new Auth(authProps);
      const validRecoveryPassword = auth.getValidRecoveryPassword();
      expect(validRecoveryPassword).toBeInstanceOf(RecoveryPassword);
      expect(validRecoveryPassword.isValid()).toBeTruthy();

      validRecoveryPassword.invalidate();
      const invalidToken = auth.getValidRecoveryPassword();
      expect(invalidToken).toBeUndefined();
    });

    it('should return undefined in case of not exists valid recovery password', () => {
      const auth = new Auth({
        ...authProps,
        activeRecoveryPassword: [],
      });

      expect(auth.getValidRecoveryPassword()).toBeUndefined();
    });

    it('should change password', () => {
      const spyOnMethod = jest.spyOn(Password, 'createFromPlain');
      const auth = new Auth(authProps);
      const newPlainPassword = 'new-password';
      auth.changePassword(newPlainPassword);
      expect(auth.passwordMatchs(newPlainPassword)).toBeTruthy();
      expect(spyOnMethod).toBeCalledWith(newPlainPassword);
    });

    it('should not change password if new password is equal to old one', () => {
      const auth = new Auth(authProps);
      expect(() => auth.changePassword(defaultPlainPassword)).toThrow(
        DomainError,
      );
    });

    it('should not change password if new password is invalid', () => {
      const auth = new Auth(authProps);
      expect(() => auth.changePassword('123')).toThrow(DomainError);
    });

    it('should not change password if new password is undefined', () => {
      const auth = new Auth(authProps);
      expect(() => auth.changePassword(undefined)).toThrow();
    });

    it('should get password hash', () => {
      const auth = new Auth(authProps);
      const hash = auth.getPasswordHash();
      expect(hash).toEqual(auth.password.value.hash);
    });

    it('should test if password matchs', () => {
      const auth = new Auth(authProps);
      const spyOnMethod = jest.spyOn(auth.password, 'matchs');
      expect(auth.passwordMatchs(defaultPlainPassword)).toBeTruthy();
      expect(spyOnMethod).toBeCalledWith(defaultPlainPassword);
    });
    it('should ensure that password doesnt match', () => {
      const auth = new Auth(authProps);
      const spyOnMethod = jest.spyOn(auth.password, 'matchs');
      expect(auth.passwordMatchs('invalid-password')).toBeFalsy();
      expect(spyOnMethod).toBeCalledWith('invalid-password');
    });
  });
});
