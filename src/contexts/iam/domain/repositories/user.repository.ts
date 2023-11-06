import { Repository } from '@hiki9/rich-domain';
import { WriteOptions } from '@hiki9/rich-domain/dist/core/repository';
import { User } from '@iam/domain/entities';

export abstract class UserRepository extends Repository.WriteAndRead<User> {
  abstract findByUsername(username: string): Promise<User>;
  abstract findByEmail(email: string): Promise<User>;
  abstract findByRecoveryToken(token: string): Promise<User | null>;
  abstract findByOAuthUserId(id: string): Promise<User | null>;
  abstract removeUserAccess(user: User, options?: WriteOptions): Promise<void>;
  abstract restoreUserAccess(user: User, options?: WriteOptions): Promise<void>;
  abstract findByRefreshToken(token: string): Promise<User | null>;
}
