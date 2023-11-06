import { Group, User } from '@iam/domain/entities';

export interface UnsubscribeUserToGroupCommandProps {
  user: User;
  group: Group;
}
/**
 * Unsubscribe user to group.
 * @param user {User}
 * @param group {Group}
 */
export class UnsubscribeUserToGroupCommand {
  constructor(public readonly props: UnsubscribeUserToGroupCommandProps) {}
}
