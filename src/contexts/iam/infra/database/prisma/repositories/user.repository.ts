import { Repository } from '@hiki9/rich-domain';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import {
  PrismaUserToDomainAdapter,
  PrismaUserToPersistenceAdapter,
} from '@iam/infra/database/prisma/adapters';
import { UserSchema } from '@iam/infra/database/prisma/schema/user.schema';
import {
  PrismaRepository,
  PrismaService,
  UnitOfWorkService,
} from '@lib/common';
import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository
  extends PrismaRepository<User, UserSchema>
  implements UserRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly adapterToDomain: PrismaUserToDomainAdapter,
    protected readonly adapterToPersistence: PrismaUserToPersistenceAdapter,
    protected readonly unitOfWorkService: UnitOfWorkService,
  ) {
    super(prisma, adapterToDomain, adapterToPersistence, unitOfWorkService);
  }

  get model(): Prisma.ModelName {
    return 'user';
  }

  protected findIncludes: Prisma.userFindManyArgs['include'] = {
    profile: {
      include: {
        address: true,
      },
    },
    groupParticipants: {
      include: {
        group: true,
      },
    },
    permissions: true,
    entitiesAccessControl: true,
    authentication: true,
  };

  protected uniqueIncludes: Prisma.userFindUniqueArgs['include'] = {
    profile: {
      include: {
        address: true,
      },
    },
    groupParticipants: {
      include: {
        group: {
          include: {
            permission: true,
          },
        },
      },
    },
    permissions: true,
    entitiesAccessControl: true,
    authentication: {
      include: {
        refreshToken: true,
        recoveryPassword: true,
      },
    },
  };

  public async findByRecoveryToken(token: string): Promise<User> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = {
      authentication: {
        recoveryPassword: {
          some: {
            token,
          },
        },
      },
    };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }
  public async findByEmail(email: string): Promise<User> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = { email };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }

  public async findByRefreshToken(token: string): Promise<User | null> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = {
      authentication: {
        refreshToken: {
          some: {
            token,
          },
        },
      },
    };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }

  public async findByOAuthUserId(
    externalUserProviderId: string,
  ): Promise<User> {
    const context = this.getContext();
    const query = {} as Prisma.userFindFirstArgs;
    query.where = {
      authentication: {
        oauth: {
          some: {
            externalUserProviderId,
          },
        },
      },
    };

    const model = await context.user.findFirst({
      ...query,
      include: this.uniqueIncludes,
    });

    if (!model) {
      return null;
    }

    const domain = this.adapterToDomain.build(model as unknown as UserSchema);
    return domain;
  }

  public async removeUserAccess(
    user: User,
    options?: Repository.WriteOptions,
  ): Promise<void> {
    user;
    options;
    throw new MethodNotAllowedException();
  }

  public async restoreUserAccess(
    user: User,
    options?: Repository.WriteOptions,
  ): Promise<void> {
    user;
    options;
    throw new MethodNotAllowedException();
  }

  protected generateSearchQuery(search: string): Prisma.userWhereInput {
    const containsSearch = {
      contains: search.toLowerCase(),
      mode: 'insensitive',
    } as const;

    return {
      OR: [
        { id: containsSearch },
        { email: containsSearch },
        {
          profile: {
            OR: [
              { phone: containsSearch },
              { firstName: containsSearch },
              { lastName: containsSearch },
              { office: containsSearch },
            ],
          },
        },
        {
          groupParticipants: {
            some: {
              group: { name: containsSearch },
            },
          },
        },
      ],
    };
  }
}
