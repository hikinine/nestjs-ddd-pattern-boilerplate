import { Pagination, PaginationCriteria } from '@hiki9/rich-domain';
import { ItemNotFound } from '@hiki9/rich-domain/dist/core/repository-errors';
import {
  ChangeGroupPermissionAdapter,
  CreateGroupWithPermissionsAdapter,
} from '@iam/application/adapter';
import {
  ChangeGroupPermissionCommand,
  CreateGroupCommand,
} from '@iam/domain/command';
import { Group } from '@iam/domain/entities';
import { FindGroupsQuery } from '@iam/domain/queries';
import {
  ChangeGroupPermissionInput,
  CreateGroupWithPermissionsInput,
} from '@iam/presentation/http/dto';
import { EventPublisher, UnitOfWorkService } from '@lib/common';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
@Injectable()
export class GroupService {
  constructor(
    @Inject(forwardRef(() => EventPublisher))
    private readonly publisher: EventPublisher,
    private readonly createGroupAdapter: CreateGroupWithPermissionsAdapter,
    private readonly changeGroupAdapter: ChangeGroupPermissionAdapter,
    private readonly unitOfWork: UnitOfWorkService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.unitOfWork.allowTransaction(this);
  }

  async createGroupWithPermissions(
    dto: CreateGroupWithPermissionsInput,
  ): Promise<void> {
    const groupProps = this.createGroupAdapter.build(dto);
    const group = new Group(groupProps);
    const command = new CreateGroupCommand({ group });
    await this.commandBus.execute(command);
    await group.dispatchAll(this.publisher);
  }

  async updateGroupWithPermissions(dto: ChangeGroupPermissionInput) {
    const group = await this.findById(dto.groupId);
    const propsToChange = this.changeGroupAdapter.build(dto);
    const command = new ChangeGroupPermissionCommand({ group, propsToChange });
    await this.commandBus.execute(command);
    await group.dispatchAll(this.publisher);
  }

  async overview(criteria: PaginationCriteria): Promise<Pagination<Group>> {
    const query = new FindGroupsQuery({ criteria });
    const pagination: Pagination<Group> = await this.queryBus.execute(query);
    return pagination;
  }

  async findById(groupId: string): Promise<Group> {
    const query = new FindGroupsQuery({ groupId });
    const group: Group = await this.queryBus.execute(query);
    if (!(group instanceof Group)) {
      throw new ItemNotFound('Grupo', groupId);
    }
    return group;
  }

  async findByName(groupName: string): Promise<Group> {
    const query = new FindGroupsQuery({ groupName });
    const group: Group = await this.queryBus.execute(query);
    if (!(group instanceof Group)) {
      throw new ItemNotFound('Grupo', groupName);
    }
    return group;
  }
}
