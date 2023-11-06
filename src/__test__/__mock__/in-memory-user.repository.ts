import {
  Adapter,
  Pagination,
  PaginationCriteria,
  Repository,
} from '@hiki9/rich-domain/dist';
import { WriteOptions } from '@hiki9/rich-domain/dist/core';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryUserRepository
  extends Repository.Impl<User>
  implements UserRepository
{
  protected users = [] as User[];

  protected adapterToDomain: Adapter<unknown, User>;
  protected adapterToPersistence: Adapter<User, unknown>;
  get model(): any {
    return;
  }
  async findByUsername(username: string): Promise<User> {
    return this.users.find((u) => u.username.value === username);
  }
  findByEmail(email: string): Promise<User> {
    return;
  }
  findByRecoveryToken(token: string): Promise<User> {
    return;
  }
  removeUserAccess(user: User, options?: WriteOptions): Promise<void> {
    return;
  }
  restoreUserAccess(user: User, options?: WriteOptions): Promise<void> {
    return;
  }
  findByRefreshToken(token: string): Promise<User> {
    return;
  }
  find(criteria: PaginationCriteria): Promise<Pagination<User>> {
    return;
  }
  async findById(id: string): Promise<User> {
    return this.users.find((u) => u.id.value === id);
  }

  async create?(entity: User): Promise<void> {
    if (this.users.find((u) => u.id.value === entity.id.value)) {
      throw new ConflictException('User already exists');
    }
    this.users.push(entity);
  }
  async update?(entity: User): Promise<void> {
    const userPosition = this.users.findIndex(
      (u) => u.id.value === entity.id.value,
    );

    if (userPosition === -1) {
      throw new Error('User does not exists');
    }

    this.users[userPosition] = entity;
  }
  delete(entity: User, options?: WriteOptions<unknown>): Promise<void> {
    return;
  }
  findByOAuthUserId(id: string): Promise<User> {
    return {} as any;
  }
}
