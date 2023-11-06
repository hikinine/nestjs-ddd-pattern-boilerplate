import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { DomainError } from '@hiki9/rich-domain/dist';
import { RecoveryPasswordCommandHandler } from '@iam/application/command';
import { RecoveryPasswordCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('Command RecoveryPasswordCommand', () => {
  let app: INestApplication;
  let handler: RecoveryPasswordCommandHandler;
  let command: RecoveryPasswordCommand;
  const plainPassword = 'random-password';
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(RecoveryPasswordCommandHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    let token: string;
    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute(
      {
        password: plainPassword,
      },
      (user) => {
        const recoveryToken = user.registerAnRequestToRecoveryPassword();
        token = recoveryToken.token;
      },
    );
    command = new RecoveryPasswordCommand({
      user,
      token,
      password: randomUUID(),
    });
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['repo']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should recovery password', async () => {
      const spyOnMethods = jest.spyOn(handler['repo'], 'update');
      const response = await handler.execute(command);
      expect(response).toBeUndefined();
      expect(spyOnMethods).toBeCalledTimes(1);
    });

    it('should ensure recoveryPassword method was called', async () => {
      const spyOnMethods = jest.spyOn(command.props.user, 'recoveryPassword');
      const response = await handler.execute(command);
      expect(response).toBeUndefined();
      expect(spyOnMethods).toBeCalledTimes(1);
      expect(spyOnMethods).toBeCalledWith(
        command.props.password,
        command.props.token,
      );
    });

    it('should ensure update method was called', async () => {
      const spyOnMethods = jest.spyOn(handler['repo'], 'update');
      await expect(handler.execute(command)).resolves.toBeUndefined();
      expect(spyOnMethods).toBeCalledWith(command.props.user);
    });

    it('should throw error if token is invalid', async () => {
      const invalidCommand = new RecoveryPasswordCommand({
        user: command.props.user,
        password: command.props.password,
        token: 'some-invalid-token',
      });
      await expect(handler.execute(invalidCommand)).rejects.toBeInstanceOf(
        DomainError,
      );
    });
  });
});
