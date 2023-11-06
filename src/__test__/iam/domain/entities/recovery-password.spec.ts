import { Domain } from '@hiki9/rich-domain/dist';
import { RecoveryPassword, RecoveryPasswordProps } from '@iam/domain/entities';
import { seconds } from '@lib/utils';

describe('recovery-password entity', () => {
  let recoveryPasswordProps: RecoveryPasswordProps;
  beforeEach(() => {
    recoveryPasswordProps = {
      expiresAt: new Date(),
      passwordWasRecovered: false,
    };
  });

  describe('recovery-password entity basics', () => {
    it('should be defined', () => {
      expect(RecoveryPassword).toBeTruthy();
    });

    it('should generate random token', () => {
      const id = RecoveryPassword.generateRandomToken();
      expect(id).toBeInstanceOf(Domain.Id);
      expect(typeof id.value).toEqual('string');
    });

    it('should create an valid recovery-password', () => {
      const recoveryPassword = new RecoveryPassword(recoveryPasswordProps);
      expect(recoveryPassword).toBeInstanceOf(RecoveryPassword);
    });

    it('should ensure that every type matchs with expected', () => {
      const recoveryPassword = new RecoveryPassword(recoveryPasswordProps);
      expect(recoveryPassword.expiresAt).toBeInstanceOf(Date);
      expect(typeof recoveryPassword.token).toEqual('string');
      expect(typeof recoveryPassword.passwordWasRecovered).toEqual('boolean');
      expect(
        recoveryPassword.passwordWasRecoveredAt instanceof Date ||
          recoveryPassword.passwordWasRecoveredAt === null,
      ).toBeTruthy();
    });

    it('should get expiresAt', () => {
      const recoveryPassword = new RecoveryPassword(recoveryPasswordProps);
      expect(recoveryPassword.expiresAt).toEqual(
        recoveryPasswordProps.expiresAt,
      );
    });

    it('should token value be the ID value', () => {
      const recoveryPassword = new RecoveryPassword(recoveryPasswordProps);
      const id = recoveryPassword.id.value;
      const token = recoveryPassword.token;
      expect(token).toEqual(id);
    });

    it('should transformBeforeCreate hook', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword).toBeInstanceOf(RecoveryPassword);
      expect(recoveryPassword.expiresAt).toBeInstanceOf(Date);
      expect(recoveryPassword.passwordWasRecovered).toBeFalsy();
      expect(recoveryPassword.passwordWasRecoveredAt).toBeNull();
    });

    it('should test expiresAt default value when not provided', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword.expiresAt).toBeInstanceOf(Date);
      const defaultExpiresTime = recoveryPassword.expiresAt.getTime();
      const expectedTime = Date.now() + RecoveryPassword.EXPIRES_AT;

      expect(Math.abs(defaultExpiresTime - expectedTime)).toBeLessThan(
        seconds(10),
      );
    });

    it('should test passwordWasRecovered default value when not provided', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword.passwordWasRecovered).toBeFalsy();
    });

    it('should test recovery url', () => {
      const recoveryPassword = new RecoveryPassword();
      const url = recoveryPassword.recoveryUrl;
      expect(url).toEqual(`/recovery-password/${recoveryPassword.token}`);
    });
  });

  describe('recovery-password entity change methods', () => {
    it('should count how many till expires', () => {
      const recoveryPassword = new RecoveryPassword();
      const diff = recoveryPassword.countHowManyTillExpires();
      expect(typeof diff).toEqual('number');
      expect(diff).toBeGreaterThanOrEqual(0);
    });

    it('should count how many till expires and recive an negative value', () => {
      const recoveryPassword = new RecoveryPassword({
        expiresAt: new Date(Date.now() - seconds(1)),
      });
      const diff = recoveryPassword.countHowManyTillExpires();
      expect(typeof diff).toEqual('number');
      expect(diff).toBeLessThan(0);
    });
    it('should invalidate', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword.expiresAt.getTime()).toBeGreaterThan(Date.now());
      recoveryPassword.invalidate();
      expect(recoveryPassword.expiresAt.getTime()).toBeLessThan(Date.now());
    });
    it('revoke method is ALIAS for invalidate, just ensure that is beeing called', () => {
      const recoveryPassword = new RecoveryPassword();
      const spyOnMethod = jest.spyOn(recoveryPassword, 'invalidate');
      recoveryPassword.revoke();
      expect(spyOnMethod).toHaveBeenCalled();
    });

    it('should recovery', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword.passwordWasRecovered).toBeFalsy();
      expect(recoveryPassword.passwordWasRecoveredAt).toBeNull();
      recoveryPassword.recovery();
      expect(recoveryPassword.passwordWasRecovered).toBeTruthy();
      expect(recoveryPassword.passwordWasRecoveredAt).toBeInstanceOf(Date);
      expect(
        Math.abs(
          recoveryPassword.passwordWasRecoveredAt.getTime() - Date.now(),
        ),
      ).toBeLessThan(seconds(10));
    });
    it('should renew the expiration date if password was not recovered yet', () => {
      const recoveryPassword = new RecoveryPassword({
        passwordWasRecovered: false,
      });
      const expiresAt = recoveryPassword.expiresAt.getTime();
      recoveryPassword.renew();
      expect(recoveryPassword.expiresAt.getTime()).toBeGreaterThanOrEqual(
        expiresAt,
      );
      expect(Math.abs(recoveryPassword.expiresAt.getTime() - Date.now()));
    });

    it('should does nothing if password was already recovered', () => {
      const recoveryPassword = new RecoveryPassword({
        passwordWasRecovered: true,
      });
      const expiresAt = recoveryPassword.expiresAt.getTime();
      recoveryPassword.renew();
      expect(recoveryPassword.expiresAt.getTime()).toEqual(expiresAt);
    });

    it('should check if token is valid', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword.isValid()).toBeTruthy();
      recoveryPassword.invalidate();
      expect(recoveryPassword.isValid()).toBeFalsy();
    });

    it('should check if token is valid with passwordWasRecovered', () => {
      const recoveryPassword = new RecoveryPassword({
        passwordWasRecovered: true,
      });
      expect(recoveryPassword.isValid()).toBeFalsy();
    });

    it('should check if token is valid with expiresAt', () => {
      const recoveryPassword = new RecoveryPassword({
        expiresAt: new Date(Date.now() - seconds(1)),
      });
      expect(recoveryPassword.isValid()).toBeFalsy();
    });

    it('should check if is expired', () => {
      const recoveryPassword = new RecoveryPassword();
      expect(recoveryPassword.isExpired()).toBeFalsy();
      recoveryPassword.invalidate();
      expect(recoveryPassword.isExpired()).toBeTruthy();

      const recovery2 = new RecoveryPassword({
        expiresAt: new Date(Date.now() - seconds(1)),
      });
      expect(recovery2.isExpired()).toBeTruthy();
    });
  });
});
