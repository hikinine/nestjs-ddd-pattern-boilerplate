import { User } from '../entities';

export interface CleanAllUserDataCommandProps {
  user: User;
}
/**
 * @warning Should not use this command.
 * Revoke all user data, then delete user..
 */
export class CleanAllUserDataCommand {
  constructor(public readonly props: CleanAllUserDataCommandProps) {}
}
