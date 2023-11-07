import { Pagination, PaginationCriteria } from '@hiki9/rich-domain/dist';
import { UserService } from '@iam/application/service';
import {
  UserActiveStatusChangedEvent,
  UserCreatedEvent,
} from '@iam/domain/events';
import {
  ChangeUserActiveStatusInput,
  ChangeUserPermissionsInput,
  CreateUserInput,
  SubscribeUserToGroupInput,
  UpdateUserProfileInput,
  UserOutput,
  UserSummary,
} from '@iam/presentation/http/dto';
import {
  AcknowledgeOnSuccess,
  AuthenticateGuard,
  AuthorizationGuard,
  HttpExceptionFilter,
  PermissionTo,
  RequiredPermissions,
  eventContextParser,
} from '@lib/common';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Ctx, EventPattern, RmqContext } from '@nestjs/microservices';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiCookieAuth()
@ApiTags('user')
@Controller('/iam/user')
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthenticateGuard, AuthorizationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @RequiredPermissions(PermissionTo.Create.Iam)
  async createUser(@Body() dto: CreateUserInput): Promise<void> {
    await this.userService.createUser(dto);
    return void 0;
  }

  @Put('/')
  @RequiredPermissions(PermissionTo.Update.Iam)
  async updateUser(@Body() dto: UpdateUserProfileInput): Promise<void> {
    await this.userService.updateUserProfile(dto);
    return void 0;
  }

  @Put('/change-permissions')
  @RequiredPermissions(PermissionTo.Manage.Iam)
  async changeUserPermissions(
    @Body() dto: ChangeUserPermissionsInput,
  ): Promise<void> {
    await this.userService.changeUserPermissions(dto);
    return void 0;
  }

  @Put('/change-active-status')
  @RequiredPermissions(PermissionTo.Manage.Iam)
  async changeUserActiveStatus(
    @Body() dto: ChangeUserActiveStatusInput,
  ): Promise<void> {
    await this.userService.changeUserActiveStatus(dto);
    return void 0;
  }

  @Post('/subscribe-to-group')
  @RequiredPermissions(PermissionTo.Manage.Iam)
  async subscribeToGroup(@Body() dto: SubscribeUserToGroupInput) {
    await this.userService.subscribeToGroup(dto);
    return void 0;
  }

  @Post('/unsubscribe-to-group')
  @RequiredPermissions(PermissionTo.Manage.Iam)
  async unsubscribeToGroup(
    @Body() dto: SubscribeUserToGroupInput,
  ): Promise<void> {
    await this.userService.unsubscribeToGroup(dto);
    return void 0;
  }

  @Get('/me')
  async getMyOwnProfile(): Promise<UserOutput> {
    const user = await this.userService.getMyOwnProfile();
    return new UserOutput(user);
  }

  @Get('/')
  @RequiredPermissions(PermissionTo.Read.Iam)
  async getUsers(@Query() query: object): Promise<Pagination<UserSummary>> {
    const criteria = new PaginationCriteria(query);
    const pagination = await this.userService.overview(criteria);
    return pagination.convertTo(UserSummary);
  }

  @Get('/id/:id')
  @RequiredPermissions(PermissionTo.Read.Iam)
  async getUserById(@Param('id') id: string): Promise<UserOutput> {
    const user = await this.userService.findUserById(id);
    return new UserOutput(user);
  }

  @EventPattern(UserCreatedEvent.name)
  @AcknowledgeOnSuccess()
  async UserCreatedEventHandler(@Ctx() context: RmqContext): Promise<void> {
    const { aggregate } = eventContextParser<UserCreatedEvent>(context);
    const { id: userId } = aggregate;
    await this.userService.UserCreatedEventHandler(userId);
  }

  @EventPattern(UserActiveStatusChangedEvent.name)
  @AcknowledgeOnSuccess()
  async UserActiveStatusChangedEventHandler(
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const { aggregate } =
      eventContextParser<UserActiveStatusChangedEvent>(context);
    const { id: userId } = aggregate;

    await this.userService.UserActiveStatusChangedEventHandler(userId);
  }
}
