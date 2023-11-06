import { Group, User } from '@iam/domain/entities';

export interface SubscribeUserToGroupCommandProps {
  user: User;
  group: Group;
}
/**
 * Subscribe user to group.
 * @param user {User}
 * @param group {Group}
 */
export class SubscribeUserToGroupCommand {
  constructor(public readonly props: SubscribeUserToGroupCommandProps) {}
}
