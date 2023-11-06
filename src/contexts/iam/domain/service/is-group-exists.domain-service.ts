import { Domain } from '@hiki9/rich-domain';
import { GroupRepository } from '@iam/domain/repositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IsGroupExistsDomainService
  implements Domain.Service<string, boolean>
{
  constructor(private readonly repo: GroupRepository) {}

  async execute(groupName: string): Promise<boolean> {
    try {
      const group = await this.repo.findByName(groupName);
      if (!group) return false;

      return Boolean(group);
    } catch (error) {
      return false;
    }
  }
}
