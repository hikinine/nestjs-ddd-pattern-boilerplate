import { Group } from '@iam/domain/entities';

export interface CreateGroupCommandProps {
  group: Group;
}
/**
 * Create new group. It throw ConflictException if group already exists.
 * @param group {Group}
 */
export class CreateGroupCommand {
  constructor(public readonly props: CreateGroupCommandProps) {}
}
