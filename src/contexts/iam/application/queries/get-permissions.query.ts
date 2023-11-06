import { GetPermissionsQuery } from '@iam/domain/queries';
import { GroupRepository } from '@iam/domain/repositories';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsQueryHandler
  implements IQueryHandler<GetPermissionsQuery>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(): Promise<string[]> {
    const permissions = await this.groupRepository.getPermissionsList();
    return permissions;
  }
}
