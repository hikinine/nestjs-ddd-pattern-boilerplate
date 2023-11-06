import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { CleanAllUserDataCommandHandler } from '@iam/application/command';
import { CleanAllUserDataCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { AuthorContextService } from '@lib/common';
import { INestApplication } from '@nestjs/common';

describe('Command CleanAllUserDataCommand', () => {
  let app: INestApplication;
  let handler: CleanAllUserDataCommandHandler;
  let command: CleanAllUserDataCommand;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(CleanAllUserDataCommandHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute();
    command = new CleanAllUserDataCommand({ user });
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['userRepository']).toBeDefined();
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
  });
  describe('execute handler', () => {
    it('should delete user', async () => {
      const user = command.props.user;
      await expect(handler.execute(command)).resolves.toBeUndefined();
      expect(user.isActive()).toBeFalsy();
    });

    it('should delete user ', async () => {
      const spyOnMethod = jest.spyOn(handler['userRepository'], 'delete');
      const spyOnRevoke = jest.spyOn(command.props.user, 'revokeAll');
      await handler.execute(command);
      expect(spyOnMethod).toBeCalledTimes(1);
      expect(spyOnRevoke).toBeCalledTimes(1);
    });
  });
});
