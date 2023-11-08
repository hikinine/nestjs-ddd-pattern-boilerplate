import { Domain } from '@hiki9/rich-domain';
import { UserRepository } from '@iam/domain/repositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IsUserExistsDomainService
  implements Domain.Service<string, boolean>
{
  constructor(private readonly repo: UserRepository) {}

  async execute(email: string): Promise<boolean> {
    try {
      const user = await this.repo.findByEmail(email);
      if (!user) return false;

      return Boolean(user);
    } catch (error) {
      return false;
    }
  }
}
