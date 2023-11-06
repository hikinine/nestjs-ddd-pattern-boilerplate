import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateGroupProps } from '@app/__test__/__mock__/generate-group-props';
import { CreateGroupCommandHandler } from '@iam/application/command';
import { CreateGroupCommand } from '@iam/domain/command';
import { Group } from '@iam/domain/entities';
import { IsGroupExistsDomainService } from '@iam/domain/service';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { ConflictException, INestApplication } from '@nestjs/common';

describe('Command CreateGroupCommand', () => {
  let app: INestApplication;
  let handler: CreateGroupCommandHandler;
  let command: CreateGroupCommand;
  let context: AuthorContextService;
  let author: AuthorUserContext;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(CreateGroupCommandHandler);
    context = app.get(AuthorContextService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const group = new Group(generateGroupProps());
    command = new CreateGroupCommand({ group });

    author = {
      author: new Author({
        id: '123',
        permissions: [],
        exp: 0,
      }),
    };
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['groupRepository']).toBeDefined();
    expect(handler['isGroupExistsDomainService']).toBeInstanceOf(
      IsGroupExistsDomainService,
    );
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
  });
  describe('execute handler', () => {
    it('should create a new group', async () => {
      await context.run(author, async () => {
        await expect(handler.execute(command)).resolves.toBeUndefined();
      });
    });

    it('should throw if group already exists', async () => {
      await context.run(author, async () => {
        await handler.execute(command);
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ConflictException,
        );
      });
    });

    it('should ensure author was set', async () => {
      await context.run(author, async () => {
        const spyOnMethod = jest.spyOn(command.props.group, 'setAuthor');
        await handler.execute(command);
        expect(spyOnMethod).toBeCalledTimes(1);
      });
    });

    it('should ensure create method was called', async () => {
      await context.run(author, async () => {
        const spyOnMethod = jest.spyOn(handler['groupRepository'], 'create');
        await handler.execute(command);
        expect(spyOnMethod).toBeCalledTimes(1);
      });
    });
    it('should ensure isGroupExistsDomainService was called', async () => {
      await context.run(author, async () => {
        const spyOnMethod = jest.spyOn(
          handler['isGroupExistsDomainService'],
          'execute',
        );
        await handler.execute(command);
        expect(spyOnMethod).toBeCalledWith(command.props.group.name);
      });
    });

    it('should throw if author is not defined', async () => {
      await expect(handler.execute(command)).rejects.toThrow();
    });
  });
});
