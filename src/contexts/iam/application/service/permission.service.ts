import { ApplicationLevelError } from '@hiki9/rich-domain/dist';
import { GetPermissionsQuery } from '@iam/domain/queries';
import { AuthorContextService, EventPublisher } from '@lib/common';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(forwardRef(() => EventPublisher))
    private readonly publisher: EventPublisher,
    @Inject(forwardRef(() => AuthorContextService))
    private readonly context: AuthorContextService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getPermissionList(): Promise<string[]> {
    const query = new GetPermissionsQuery();
    const permissions = await this.queryBus.execute(query);
    if (!Array.isArray(permissions)) {
      throw new ApplicationLevelError('Permission list not found');
    }
    return permissions;
  }
}
