import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { GenerateRefreshTokenCommandHandler } from '@iam/application/command';
import { GenerateRefreshTokenCommand } from '@iam/domain/command';
import { RefreshToken } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories/user.repository';
import { IamModule } from '@iam/iam.module';
import { AuthorContextService } from '@lib/common';
import { Author, AuthorUserContext } from '@lib/domain';
import { INestApplication } from '@nestjs/common';

describe('Command GenerateRefreshTokenCommand', () => {
  let app: INestApplication;
  let handler: GenerateRefreshTokenCommandHandler;
  let command: GenerateRefreshTokenCommand;
  let context: AuthorContextService;
  let author: AuthorUserContext;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(GenerateRefreshTokenCommandHandler);
    context = app.get(AuthorContextService);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute();
    command = new GenerateRefreshTokenCommand(user);

    const userAuthor = new Author({
      id: 'author-id',
      exp: 0,
      permissions: [],
    });
    author = {
      userAgent: 'user-agent',
      author: userAuthor,
    };
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
    expect(handler['userRepository']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should generate a new refresh token', async () => {
      await context.run(author, async () => {
        const token = await handler.execute(command);
        expect(token).toBeInstanceOf(RefreshToken);
      });
    });

    it('should call registerAnRefreshTokenAccess method with user agent', async () => {
      await context.run(author, async () => {
        const spy = jest.spyOn(command.user, 'registerAnRefreshTokenAccess');
        await handler.execute(command);
        expect(spy).toHaveBeenCalledWith(author.userAgent);
      });
    });
    it('should call registerAnRefreshTokenAccess method without user agent', async () => {
      const spy = jest.spyOn(command.user, 'registerAnRefreshTokenAccess');
      await handler.execute(command);
      expect(spy).toHaveBeenCalledWith(undefined);
    });

    it('should call update method', async () => {
      await context.run(author, async () => {
        const spy = jest.spyOn(handler['userRepository'], 'update');
        await handler.execute(command);
        expect(spy).toHaveBeenCalledWith(command.user);
      });
    });
  });
});
