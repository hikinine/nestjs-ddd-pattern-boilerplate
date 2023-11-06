import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { GenerateAccessTokenCommandHandler } from '@iam/application/command';
import { GenerateAccessTokenCommand } from '@iam/domain/command';
import { Auth, User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { Password, SignInToken } from '@iam/domain/value-object';
import { IamModule } from '@iam/iam.module';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('Command GenerateAccessTokenCommand', () => {
  let app: INestApplication;
  let handler: GenerateAccessTokenCommandHandler;
  let command: GenerateAccessTokenCommand;
  let user: User;
  const plainPassword = '12345678';
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(GenerateAccessTokenCommandHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const propsToAppend = {
      auth: new Auth({
        password: Password.createFromPlain(plainPassword),
      }),
    };
    const factory = new CreateDefaultUserFactory(userRepository);
    user = await factory.execute(propsToAppend);
    command = new GenerateAccessTokenCommand(user, plainPassword);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['jwtService']).toBeInstanceOf(JwtService);
  });
  describe('execute handler', () => {
    it('should generate a new access token', async () => {
      const token = await handler.execute(command);
      expect(token).toBeInstanceOf(SignInToken);
    });

    it('should throw an error when user password is invalid', async () => {
      const command = new GenerateAccessTokenCommand(user, 'invalid-password');
      await expect(handler.execute(command)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should call method signInWithStrategy from user entity', async () => {
      const spy = jest.spyOn(command.user, 'signInWithStrategy');
      await handler.execute(command);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call passwordMatchsWith from user entity', async () => {
      const spy = jest.spyOn(command.user, 'passwordMatchsWith');
      await handler.execute(command);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith(plainPassword);
    });
  });
});
