import { DatabaseModule } from '@lib/common';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as ApplicationAdapter from './application/adapter';
import * as Command from './application/command/';
import * as Query from './application/queries/';
import * as ApplicationService from './application/service';
import { JwtConfig } from './config/jwt.config';
import {
  AuthenticateStrategyPolicy,
  AuthenticateStrategyWithJwtSpecification,
} from './domain/policies';
import { GroupRepository, UserRepository } from './domain/repositories';
import * as DomainService from './domain/service';
import * as Adapter from './infra/database/prisma/adapters';
import * as Repositories from './infra/database/prisma/repositories';
import * as Controllers from './presentation/http/controllers';

const commands = [
  Command.CreateUserCommandHandler,
  Command.ChangeUserPermissionsCommandHandler,
  Command.CleanAllUserDataCommandHandler,
  Command.RevokeUserAccessCommandHandler,
  Command.UpdateUserBasicInfoCommandHandler,
  Command.SendEmailCommandHandler,
  Command.CreateGroupCommandHandler,
  Command.SubscribeUserToGroupCommandHandler,
  Command.UnsubscribeUserToGroupCommandHandler,
  Command.ChangeGroupPermissionCommandHandler,
  Command.SignOutCommandHandler,
  Command.GenerateAccessTokenCommandHandler,
  Command.GenerateRefreshTokenCommandHandler,
  Command.AuthenticateUserWithRefreshTokenCommandHandler,
  Command.AskForRecoveryPasswordCommandHandler,
  Command.RecoveryPasswordCommandHandler,
  Command.RestoreUserAccessCommandHandler,
];

const queries = [
  Query.FindUserQueryHandler,
  Query.FindGroupsQueryHandler,
  Query.GetPermissionsQueryHandler,
];

const repositoryAdapter = [
  Adapter.PrismaGroupToDomainAdapter,
  Adapter.PrismaGroupToPersistenceAdapter,
  Adapter.PrismaUserToDomainAdapter,
  Adapter.PrismaUserToPersistenceAdapter,
];

const applicationAdapter = [
  ApplicationAdapter.CreateUserInputAdapter,
  ApplicationAdapter.CreateGroupWithPermissionsAdapter,
  ApplicationAdapter.ChangeUserPermissionsInputAdapter,
  ApplicationAdapter.ChangeGroupPermissionAdapter,
  ApplicationAdapter.UpdateUserBasicInfoAdapter,
];

const applicationService = [
  ApplicationService.UserService,
  ApplicationService.PermissionService,
  ApplicationService.GroupService,
  ApplicationService.AuthenticationService,
];

const domainService = [
  DomainService.IsUserExistsDomainService,
  DomainService.IsGroupExistsDomainService,
];

const repositories = [
  {
    provide: UserRepository,
    useClass: Repositories.PrismaUserRepository,
  },

  {
    provide: GroupRepository,
    useClass: Repositories.PrismaGroupRepository,
  },
];

const policies = [
  {
    provide: AuthenticateStrategyPolicy,
    useClass: AuthenticateStrategyWithJwtSpecification,
  },
];

const controllers = [
  Controllers.AuthenticationController,
  Controllers.UserController,
  Controllers.GroupsController,
  Controllers.PermissionController,
];
@Module({
  imports: [DatabaseModule, JwtModule.register(JwtConfig)],
  controllers,
  providers: [
    ...commands,
    ...queries,
    ...repositoryAdapter,
    ...applicationAdapter,
    ...applicationService,
    ...domainService,
    ...policies,
    ...repositories,
  ],
  exports: [ApplicationService.AuthenticationService],
})
export class IamModule {}
