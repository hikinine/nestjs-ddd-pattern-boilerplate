import { User } from '@iam/domain/entities';

export interface CreateUserCommandProps {
  user: User;
}
export type CreateUserCommandResponse = User;

/**
 * Create new user. It throw ConflictException if user already exists.
 * @param user {User}
 */
export class CreateUserCommand {
  constructor(public readonly props: CreateUserCommandProps) {}
}
