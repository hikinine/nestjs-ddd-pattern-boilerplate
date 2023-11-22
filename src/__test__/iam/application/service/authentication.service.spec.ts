import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { AppModule } from '@app/app.module';
import { Email } from '@app/contexts/shared/domain';
import {
  ApplicationLevelError,
  DomainError,
  ItemNotFound,
} from '@hiki9/rich-domain/dist/core';
import { AuthenticationService, UserService } from '@iam/application/service';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { SignInToken } from '@iam/domain/value-object';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { EventPublisherTestingFactory } from '@lib/provider/event-publisher.test-mode';
import { INestApplication, UnauthorizedException } from '@nestjs/common';

describe('auth service', () => {
  let email: string;
  const password = '12345678';
  let app: INestApplication;
  let authService: AuthenticationService;
  let userService: UserService;
  let userRepository: UserRepository;

  let context: AuthorContextService;
  let authorContext: AuthorUserContext;
  let user: User;

  beforeEach(async () => {
    const defaultEmail = 'email' + Math.random() + '@gmail.com';

    const factory = new CreateDefaultUserFactory(userRepository);
    user = await factory.execute({
      email: new Email(defaultEmail),
      password,
    });

    email = defaultEmail;
  });

  beforeAll(async () => {
    app = await createTestingModule({ imports: [AppModule] });
    authService = app.get(AuthenticationService);
    userService = app.get(UserService);
    userRepository = app.get(UserRepository);
    context = app.get(AuthorContextService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('signInWithBasic Method', () => {
    it('should sign in and keep logged in', async () => {
      const signInToken = await authService.signInWithBasic(
        email,
        password,
        true,
      );
      expect(signInToken).toBeInstanceOf(SignInToken);
      expect(signInToken.value.accessToken).toBeDefined();
      expect(signInToken.value.refreshToken).toBeDefined();
    });

    it('should sign in and not keep logged in', async () => {
      const signInToken = await authService.signInWithBasic(
        email,
        password,
        false,
      );
      expect(signInToken).toBeInstanceOf(SignInToken);
      expect(signInToken.value.accessToken).toBeDefined();
      expect(signInToken.value.refreshToken).toBeUndefined();
    });

    it('should throw, wrong password', async () => {
      const password = 'random-wrong-password';

      await expect(() =>
        authService.signInWithBasic(email, password),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
    it('should throw, wrong email', async () => {
      const email = 'random-wrong-email';

      await expect(
        authService.signInWithBasic(email, password),
      ).rejects.toBeInstanceOf(ItemNotFound);
    });
  });

  describe('signInWithRefreshToken Method', () => {
    let signInToken: SignInToken;
    beforeEach(async () => {
      signInToken = await authService.signInWithBasic(email, password, true);
      const author = new Author({
        id: user.id.value,
        exp: Date.now() + 999,
        permissions: [],
      });
      authorContext = {
        author,
        userAgent: 'random-user-agent',
      };
    });

    it("should sign in and keep logged in, if the refresh token hasn't expired", async () => {
      const { refreshToken } = signInToken.value;
      const newSignInToken =
        await authService.signInUsingRefreshToken(refreshToken);
      expect(newSignInToken).toBeInstanceOf(SignInToken);
      expect(newSignInToken.value.accessToken).toBeDefined();
      expect(newSignInToken.value.refreshToken).toBeDefined();
      expect(newSignInToken.value.refreshToken).not.toEqual(refreshToken);
    });
    it('should throw wrong refresh token', async () => {
      const refreshToken = 'random-refresh-token';
      await expect(
        authService.signInUsingRefreshToken(refreshToken),
      ).rejects.toBeInstanceOf(ItemNotFound);
    });

    it('should throw expired refresh token', async () => {
      const { refreshToken } = signInToken.value;

      await context.run(authorContext, async () => {
        await authService.revoke(refreshToken);
        await expect(
          authService.signInUsingRefreshToken(refreshToken),
        ).rejects.toBeInstanceOf(DomainError);
      });
    });

    it('should signout', async () => {
      const { refreshToken } = signInToken.value;
      await context.run(authorContext, async () => {
        await expect(
          authService.signOut(refreshToken),
        ).resolves.toBeUndefined();
        await expect(authService.signOut()).resolves.toBeUndefined();
        await expect(
          authService.signOut('random-token'),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });

    it('should revoke', async () => {
      const { refreshToken } = signInToken.value;
      await context.run(authorContext, async () => {
        await expect(authService.revoke(refreshToken)).resolves.toBeUndefined();
        await expect(
          authService.revoke(undefined as any),
        ).resolves.toBeUndefined();
        await expect(authService.revoke('random-token')).rejects.toBeInstanceOf(
          ItemNotFound,
        );
      });
    });
  });

  describe('askForRecoveryPassword', () => {
    it('should ask for recovery password', async () => {
      await expect(
        authService.askForRecoveryPassword(email),
      ).resolves.toBeUndefined();
    });

    it("should be dispatched a 'RecoveryPasswordAsked' event", async () => {
      const spy = jest.spyOn(EventPublisherTestingFactory.prototype, 'publish');
      await authService.askForRecoveryPassword(email);
      expect(spy).toBeCalled();
    });
  });

  describe('recoveryPasswordByUsingTokenThenSignIn Method', () => {
    it("should recovery password, if the token hasn't expired", async () => {
      const newPassword = '123456789';
      await authService.askForRecoveryPassword(email);
      const user = await userService.findUserByEmail(email);
      const { token } = user.auth.getValidRecoveryPassword();

      const signInToken =
        await authService.recoveryPasswordByUsingTokenThenSignIn(
          token,
          newPassword,
        );

      expect(signInToken).toBeInstanceOf(SignInToken);
    });
    it('should throw with a invalid token', async () => {
      const token = 'random-invalid-token';
      await expect(
        authService.recoveryPasswordByUsingTokenThenSignIn(token, password),
      ).rejects.toBeInstanceOf(ApplicationLevelError);
    });
  });
});
