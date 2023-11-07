import { Pagination, PaginationCriteria } from '@hiki9/rich-domain';
import { ItemNotFound } from '@hiki9/rich-domain/dist/core/repository-errors';
import {
  ChangeUserPermissionsInputAdapter,
  CreateUserInputAdapter,
} from '@iam/application/adapter';
import {
  ChangeUserPermissionsCommand,
  CreateUserCommand,
  RestoreUserAccessCommand,
  RevokeUserAccessCommand,
  SendEmailCommand,
  SendEmailCommandProps,
  SubscribeUserToGroupCommand,
  UnsubscribeUserToGroupCommand,
  UpdateUserBasicInfoCommand,
} from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { FindUserQuery, GetWebhooksRegistryQuery } from '@iam/domain/queries';
import {
  ChangeUserActiveStatusInput,
  ChangeUserPermissionsInput,
  CreateUserInput,
  SubscribeUserToGroupInput,
  UnsubscribeUserToGroupInput,
  UpdateUserProfileInput,
} from '@iam/presentation/http/dto';
import {
  Author,
  AuthorContextService,
  EventPublisher,
  UnitOfWorkService,
} from '@lib/common';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateUserBasicInfoAdapter } from '../adapter/update-user-basic-info.adapter';
import { GroupService } from './group.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => EventPublisher))
    private readonly publisher: EventPublisher,
    @Inject(forwardRef(() => AuthorContextService))
    private readonly context: AuthorContextService,
    private readonly userCreateAdapter: CreateUserInputAdapter,
    private readonly userChangePermissionAdapter: ChangeUserPermissionsInputAdapter,
    private readonly userUpdateAdapter: UpdateUserBasicInfoAdapter,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly groupService: GroupService,
    private readonly unitOfWorkService: UnitOfWorkService,
  ) {
    this.unitOfWorkService.allowTransaction(this);
  }

  async createUser(dto: CreateUserInput): Promise<void> {
    const userProps = this.userCreateAdapter.build(dto);
    const user = new User(userProps);
    const command = new CreateUserCommand({ user });
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  async updateUserProfile(dto: UpdateUserProfileInput): Promise<void> {
    const user = await this.findUserById(dto.userId);
    const propsToChange = this.userUpdateAdapter.build(dto);
    const command = new UpdateUserBasicInfoCommand(user, propsToChange);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  async changeUserActiveStatus(props: ChangeUserActiveStatusInput) {
    const { status, userId } = props;
    const user = await this.findUserById(userId);
    const command = status
      ? new RestoreUserAccessCommand(user)
      : new RevokeUserAccessCommand(user);

    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  async subscribeToGroup(props: SubscribeUserToGroupInput): Promise<void> {
    const [user, group] = await Promise.all([
      this.findUserById(props.userId),
      this.groupService.findById(props.groupId),
    ]);

    const command = new SubscribeUserToGroupCommand({ user, group });
    await this.commandBus.execute(command);
    await Promise.all([
      user.dispatchAll(this.publisher),
      group.dispatchAll(this.publisher),
    ]);
  }

  async unsubscribeToGroup(props: UnsubscribeUserToGroupInput): Promise<void> {
    const [user, group] = await Promise.all([
      this.findUserById(props.userId),
      this.groupService.findById(props.groupId),
    ]);

    const command = new UnsubscribeUserToGroupCommand({ user, group });
    await this.commandBus.execute(command);
    await Promise.all([
      user.dispatchAll(this.publisher),
      group.dispatchAll(this.publisher),
    ]);
  }

  async changeUserPermissions(dto: ChangeUserPermissionsInput): Promise<void> {
    const permissions = this.userChangePermissionAdapter.build(dto);
    const user = await this.findUserById(dto.userId);
    const command = new ChangeUserPermissionsCommand({ user, permissions });
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  async removeUserAccess(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    const command = new RevokeUserAccessCommand(user);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  async restoreUserAccess(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    const command = new RestoreUserAccessCommand(user);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  public async getMyOwnProfile(): Promise<User> {
    const author = this.context.getAuthor();
    if (!(author instanceof Author)) {
      throw new UnauthorizedException();
    }
    return this.findUserById(author.id);
  }

  public async findUserByEmail(email: string): Promise<User> {
    const query = new FindUserQuery({ email });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', email);
    }
    return user;
  }

  public async findUserByUsername(username: string): Promise<User> {
    const query = new FindUserQuery({ username });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', username);
    }
    return user;
  }

  public async findUserByRefreshToken(refreshToken: string): Promise<User> {
    const query = new FindUserQuery({ refreshToken });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', refreshToken);
    }
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const query = new FindUserQuery({ id });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', id);
    }

    return user;
  }

  async overview(criteria: PaginationCriteria): Promise<Pagination<User>> {
    const query = new FindUserQuery({ criteria });
    const pagination: Pagination<User> = await this.queryBus.execute(query);
    return pagination;
  }

  async findUserByRecoveryToken(recoveryToken: string) {
    const query = new FindUserQuery({ recoveryToken });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', recoveryToken);
    }
    return user;
  }

  async findUserByOAuthProviderId(
    externalUserProviderId: string,
  ): Promise<User> {
    const query = new FindUserQuery({ externalUserProviderId });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', externalUserProviderId);
    }
    return user;
  }

  async UserCreatedEventHandler(userId: string): Promise<void> {
    userId;
    try {
      const query = new GetWebhooksRegistryQuery('UserCreatedEvent');
      const webhooks = await this.queryBus.execute(query);
      for (const webhook of webhooks) {
        if (webhook.actionToSendEmail()) {
          const props: SendEmailCommandProps = webhook.metadata;
          const command = new SendEmailCommand(props);

          await this.commandBus.execute(command);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async UserActiveStatusChangedEventHandler(userId: string): Promise<void> {
    userId;
    const query = new GetWebhooksRegistryQuery('UserActiveStatusChangedEvent');
    query;
  }
}
