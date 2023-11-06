import { Pagination, PaginationCriteria } from '@hiki9/rich-domain';
import { Group } from '@iam/domain/entities';
import { FindGroupsQuery } from '@iam/domain/queries';
import { GroupRepository } from '@iam/domain/repositories';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(FindGroupsQuery)
export class FindGroupsQueryHandler implements IQueryHandler<FindGroupsQuery> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute({
    props,
  }: FindGroupsQuery): Promise<Group | Pagination<Group>> {
    const { criteria, groupId, groupName } = props;

    if (criteria instanceof PaginationCriteria) {
      const pagination = await this.groupRepository.find(criteria);
      return pagination;
    }

    if (typeof groupId === 'string') {
      const group = await this.groupRepository.findById(groupId);
      return group;
    }

    if (typeof groupName === 'string') {
      const group = await this.groupRepository.findByName(groupName);
      return group;
    }

    throw new Error('Invalid query');
  }
}
