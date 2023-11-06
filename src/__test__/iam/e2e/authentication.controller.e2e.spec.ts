import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { AuthenticationService, UserService } from '@iam/application/service';
import { User } from '@iam/domain/entities';
import { IamModule } from '@iam/iam.module';
import { AuthenticationController } from '@iam/presentation/http/controllers';
import {
  AccessTokenCookieKey,
  RefreshTokenCookieKey,
} from '@lib/constants/cookies';
import { classValidatorPipe } from '@lib/pipes/class-validator.instance';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

function baseUrl(method: string) {
  return '/iam/authentication' + method;
}
describe('authentication.controller e2e', () => {
  const username = 'root';
  const password = '12345678';
  const email = 'root@root.com';

  let app: INestApplication;
  let httpServer: any;
  let controller: AuthenticationController;
  let jwtService: JwtService;
  let userService: UserService;
  let authService: AuthenticationService;

  let cookieRefreshToken: string;
  let Cookie: string[];

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
    });
    app.use(cookieParser());
    app.useGlobalPipes(classValidatorPipe);

    controller = app.get<AuthenticationController>(AuthenticationController);
    httpServer = app.getHttpServer();
    jwtService = app.get<JwtService>(JwtService);
    userService = app.get<UserService>(UserService);
    authService = app.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(async () => {
    await authService.signOut(cookieRefreshToken).catch(() => null);
  });

  describe('basics', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should check dependencies', () => {
      expect(controller['service']).toBeInstanceOf(AuthenticationService);
    });
  });

  describe('[METHOD] signIn', () => {
    const url = baseUrl('/sign-in');
    it('should sign in with basic with keepMeLoggedIn property', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({ username, password, keepMeLoggedIn: true })
        .set('Accept', 'application/json');

      expect(response.body).toEqual({});
      expect(response.status).toBe(201);
      const cookies = response.get('Set-Cookie');

      for (const cookie of cookies) {
        //expect(cookie).toContain('HttpOnly');
        //sexpect(cookie).toContain('SameSite=Strict');
      }

      const expectedCookies = [AccessTokenCookieKey, RefreshTokenCookieKey];
      for (const cookie of cookies) {
        const [ck] = cookie.split(';');
        const [key, value] = ck.split('=');
        expect(expectedCookies).toContain(key);
        expect(value).toBeDefined();
        expect(key).toBeDefined();
      }
    });
    it('should sign in with basic without keepMeLoggedIn property', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({ username, password, keepMeLoggedIn: false })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);

      const cookies = response.get('Set-Cookie');
      const expectedCookies = [AccessTokenCookieKey];

      for (const cookie of cookies) {
        //    expect(cookie).toContain('HttpOnly');
        //  expect(cookie).toContain('SameSite=Strict');
      }

      for (const cookie of cookies) {
        const [ck] = cookie.split(';');
        const [key] = ck.split('=');
        expect(expectedCookies).toContain(key);
        expect(key).not.toEqual(RefreshTokenCookieKey);
      }
    });
    it('should sign in and verify @accessToken', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({ username, password, keepMeLoggedIn: true })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);

      const cookies = response.get('Set-Cookie');

      for (const cookie of cookies) {
        const [ck] = cookie.split(';');
        const [key, value] = ck.split('=');
        if (key !== AccessTokenCookieKey) continue;
        const payload = jwtService.verify(value);
        expect(payload).toHaveProperty('id');
        expect(payload).toHaveProperty('username');
        expect(payload).toHaveProperty('permissions');
        expect(payload).toHaveProperty('iat');
        expect(payload).toHaveProperty('exp');
      }
    });
    it('should sign in and verify @refreshToken ensuring that is registered on database', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({ username, password, keepMeLoggedIn: true })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);

      const cookies = response.get('Set-Cookie');
      const cookie = cookies.find((cookie) => {
        const [ck] = cookie.split(';');
        const [key] = ck.split('=');
        return key === RefreshTokenCookieKey;
      });
      expect(cookie).toBeDefined();
      const [firstParameterCookie] = cookie.split(';');
      const [key, value] = firstParameterCookie.split('=');
      expect(key).toEqual(RefreshTokenCookieKey);
      const user = await userService.findUserByRefreshToken(value);
      expect(user).toBeInstanceOf(User);
    });

    it('should throw an error when username is invalid', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({
          username: 'invalid' + Math.random(),
          password,
          keepMeLoggedIn: true,
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Usuário ou senha incorreto.');
    });

    it('should throw an error when password is invalid', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({
          username,
          password: Math.random().toString(),
          keepMeLoggedIn: false,
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Usuário ou senha incorreto.');
    });
  });

  describe('[METHOD] authenticateUsingRefreshToken', () => {
    beforeEach(async () => {
      const {
        value: { accessToken, refreshToken },
      } = await authService.signInWithBasic(username, password, true);

      cookieRefreshToken = refreshToken;
      Cookie = [
        `${RefreshTokenCookieKey}=${refreshToken}`,
        `${AccessTokenCookieKey}=${accessToken}`,
      ];
    });

    const url = baseUrl('/sign-in/with-refresh-token');

    it('should authenticate using refresh token', async () => {
      const response = await request(httpServer)
        .post(url)
        .set('Cookie', Cookie)
        .set('Accept', 'application/json');

      expect(response.status).toEqual(201);
      expect(response.body).toEqual({});
    });
    it('should throw unauthorized passing random refresh token', async () => {
      const response = await request(httpServer)
        .post(url)
        .set('Cookie', [
          `${RefreshTokenCookieKey}=${Math.random()}`,
          `${AccessTokenCookieKey}=${Math.random()}`,
        ])
        .set('Accept', 'application/json');

      expect(response.status).toEqual(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual(
        'Token de autorização indisponível.',
      );
    });

    it('should ensure that authenticate changes the refresh token', async () => {
      const response = await request(httpServer)
        .post(url)
        .set('Cookie', Cookie)
        .set('Accept', 'application/json');

      const cookies = response.get('Set-Cookie');
      const rfToken = cookies.find((cookie) =>
        cookie.startsWith(RefreshTokenCookieKey),
      );

      expect(response.status).toEqual(201);
      expect(rfToken).toBeDefined();
      expect(rfToken).not.toEqual(cookieRefreshToken);
    });

    it('should ensure that authenticate changes the access token', async () => {
      const response = await request(httpServer)
        .post(url)
        .set('Cookie', Cookie)
        .set('Accept', 'application/json');

      const cookies = response.get('Set-Cookie');
      const rfToken = cookies.find((cookie) =>
        cookie.startsWith(AccessTokenCookieKey),
      );

      expect(response.status).toEqual(201);
      expect(rfToken).toBeDefined();
      expect(rfToken).not.toEqual(cookieRefreshToken);
    });
  });

  describe('[METHOD] askForRecoveryPassword', () => {
    const url = baseUrl('/ask-for-recovery-password');
    it('should ask for recovery password', async () => {
      const response = await request(httpServer).post(url).send({ email });
      expect(response.status).toEqual(201);
      expect(response.body).toEqual({});
    });

    it('should throw an error when email is invalid', async () => {
      const response = await request(httpServer)
        .post(url)
        .send({ email: 'invalid' + Math.random() + '@gmail.com' });

      expect(response.status).toEqual(452);
    });
  });

  describe('[METHOD] bitrix oauth2', () => {
    //
  });
});
