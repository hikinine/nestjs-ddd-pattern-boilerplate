import { Repository } from '@hiki9/rich-domain/dist';
import { Group } from '@iam/domain/entities';

export abstract class GroupRepository extends Repository.WriteAndRead<Group> {
  abstract findByName(groupName: string): Promise<Group | null>;
  abstract getPermissionsList(): Promise<string[]>;
}
