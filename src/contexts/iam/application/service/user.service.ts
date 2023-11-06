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
  UpdateUserInput,
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

  /**
   * Create a new user
   * @param dto {CreateUserInput}
   * @param author {AuthorUserRequestContext} aaa
   * @returns {Promise<void>}
   * @event UserCreatedEvent
   */
  async createUser(dto: CreateUserInput): Promise<void> {
    const userProps = this.userCreateAdapter.build(dto);
    const user = new User(userProps);
    const command = new CreateUserCommand({ user });
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  /**
   * Updates the basic information of a user
   * @param {UpdateUserInput} dto - The `dto` parameter is an object of type `UpdateUserInput`. It
   * contains the data needed to update a user's information.
   */
  async updateUser(dto: UpdateUserInput): Promise<void> {
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

  /**
   * Registra um usuário a um grupo
   * @param props {SubscribeUserToGroupInput}
   * @returns {Promise<void>}
   * @event UserJoinedOrLeftAnGroupEvent
   */
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

  /**
   * Remove um usuário a um grupo
   * @param props {UnsubscribeUserToGroupInput}
   * @returns {Promise<void>}
   * @event UserJoinedOrLeftAnGroupEvent
   */
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

  /**
   * @param dto {ChangeUserPermissionsInput}
   * @returns {Promise<void>}
   */
  async changeUserPermissions(dto: ChangeUserPermissionsInput): Promise<void> {
    const permissions = this.userChangePermissionAdapter.build(dto);
    const user = await this.findUserById(dto.userId);
    const command = new ChangeUserPermissionsCommand({ user, permissions });
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  /**
   * Remove user access and revoke all permissions
   * @param id {string}
   * @returns {Promise<void>}
   * @event UserActiveStatusChangedEvent
   */
  async removeUserAccess(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    const command = new RevokeUserAccessCommand(user);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  /**
   * Restores a user's access by executing a command and dispatching
   * events.
   * @param {string} userId - A string representing the unique identifier of the user whose access needs
   * to be restored.
   */
  async restoreUserAccess(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    const command = new RestoreUserAccessCommand(user);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  /**
   * Get profile of current user
   * @returns {Promise<User>}
   */
  public async getMyOwnProfile(): Promise<User> {
    const author = this.context.getAuthor();
    if (!(author instanceof Author)) {
      throw new UnauthorizedException();
    }
    return this.findUserById(author.id);
  }
  /**
   * Find user by email
   * @param email
   * @returns {Promise<User>}
   */
  public async findUserByEmail(email: string): Promise<User> {
    const query = new FindUserQuery({ email });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', email);
    }
    return user;
  }

  /**
   * Find user by username
   * @param username
   * @returns {Promise<User>}
   */
  public async findUserByUsername(username: string): Promise<User> {
    const query = new FindUserQuery({ username });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', username);
    }
    return user;
  }
  /**
   * Find user by refreshToken
   * @param refreshToken
   * @returns {Promise<User>}
   */
  public async findUserByRefreshToken(refreshToken: string): Promise<User> {
    const query = new FindUserQuery({ refreshToken });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', refreshToken);
    }
    return user;
  }

  /**
   * Find user by id
   * @param id
   * @returns {Promise<User>}
   */
  async findUserById(id: string): Promise<User> {
    const query = new FindUserQuery({ id });
    const user: User = await this.queryBus.execute(query);
    if (!(user instanceof User)) {
      throw new ItemNotFound('Usuário', id);
    }

    return user;
  }

  /**
   * Find user by email
   * @param criteria PaginationCriteria
   * @returns {Promise<Pagination<User>}
   */
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

  /**
   * Handler for {UserCreatedEvent} event
   * @param userId string
   * @handler UserCreatedEvent
   */
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

  /**
   * Handler for {UserActiveStatusChangedEvent} event
   * @param userId {string}
   * @handler UserActiveStatusChangedEvent
   */
  async UserActiveStatusChangedEventHandler(userId: string): Promise<void> {
    userId;
    const query = new GetWebhooksRegistryQuery('UserActiveStatusChangedEvent');
    query;
  }
}
