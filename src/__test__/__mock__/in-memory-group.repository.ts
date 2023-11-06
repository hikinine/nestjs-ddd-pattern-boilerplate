import {
  Adapter,
  Pagination,
  PaginationCriteria,
  Repository,
} from '@hiki9/rich-domain/dist';
import { Group } from '@iam/domain/entities';
import { GroupRepository } from '@iam/domain/repositories';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryGroupRepository
  extends Repository.Impl<Group>
  implements GroupRepository
{
  protected groups = [] as Group[];

  protected adapterToDomain: Adapter<unknown, Group>;
  protected adapterToPersistence: Adapter<Group, unknown>;
  get model(): any {
    return;
  }

  find(criteria: PaginationCriteria): Promise<Pagination<Group>> {
    return;
  }
  async findById(id: string): Promise<Group> {
    const group = this.groups.find((u) => u.id.value === id);
    if (!group) {
      throw new Error('group not found');
    }
    return group;
  }

  async create?(entity: Group): Promise<void> {
    if (this.groups.find((u) => u.id.value === entity.id.value)) {
      throw new ConflictException('group already exists');
    }
    this.groups.push(entity);
  }
  async update?(entity: Group): Promise<void> {
    const groupPosition = this.groups.findIndex(
      (u) => u.id.value === entity.id.value,
    );

    if (groupPosition === -1) {
      throw new Error('group does not exists');
    }

    this.groups[groupPosition] = entity;
  }
  delete(
    entity: Group,
    options?: Repository.WriteOptions<unknown>,
  ): Promise<void> {
    return;
  }

  findByName(groupName: string): Promise<Group> {
    return;
  }
}
